---
title: Magento - Extending an adminhtml grid
author: Cyrill
date: 2015-05-07
disqus_identifier: /2015/05/07/mage-extend-admin-grid/
categories:
  - Thoughts
tags:
  - Magento1
  - Magento2
  - Adminhtml
---

The proper way to extend any backend grid in Magento 1 and 2 without rewrites. 

<!--more-->

A new requirement for one of the stores I take care of was to extend the 
sales order grid with the new column "order comments" aka. order status 
history.

Another Magento store already implemented that feature so I digged deeper to 
found out that the used module is this one: [https://github.com/magemaven/magento-order-comment](https://github.com/magemaven/magento-order-comment).

## Magento 1 implementation

### What is wrong with the `Magemaven_OrderComment` aka. MMOC?

1. MMOC [rewrites](https://github.com/magemaven/magento-order-comment/blob/master/app%2Fcode%2Fcommunity%2FMagemaven%2FOrderComment%2Fetc%2Fconfig.xml#L53) 
the adminhtml sales order grid. Many other extension are also rewriting the sales order grid. This will result in a 
rewrite conflict and weird behaviour of your store.
2. MMOC [rewrites](https://github.com/magemaven/magento-order-comment/blob/master/app%2Fcode%2Fcommunity%2FMagemaven%2FOrderComment%2Fetc%2Fconfig.xml#L33)
the sales order grid collection only to [add](https://github.com/magemaven/magento-order-comment/blob/master/app%2Fcode%2Fcommunity%2FMagemaven%2FOrderComment%2FModel%2FResource%2FOrder%2FGrid%2FCollection.php#L26) 
the order comments in the `_afterLoad()` method. It selects all order entity IDs and uses those
for the select to the order history table to finally add the comment to the sales order model in the collection.
3. MMOC already added [dirty hacks](https://github.com/magemaven/magento-order-comment/blob/master/app%2Fcode%2Fcommunity%2FMagemaven%2FOrderComment%2FBlock%2FAdminhtml%2FSales%2FOrder%2FGrid.php#L72)
to resolve conflicts with other modules. This case to readd the "Delete Order" mass action. You cannot delete
an order ... but that is a different discussion.

Positive: MMOC adds the comment column, which retrieves its data from the collection, in the [grid block](https://github.com/magemaven/magento-order-comment/blob/master/app%2Fcode%2Fcommunity%2FMagemaven%2FOrderComment%2FBlock%2FAdminhtml%2FSales%2FOrder%2FGrid.php#L45). I've seen many other pretty bad examples like that [one](https://gist.github.com/SchumacherFM/378dc6d18ed4b3a8cb37#file-trackingnumber-php-L17) (or see the next code block) where the whole logic has been implemented in the [`render()`](https://gist.github.com/SchumacherFM/378dc6d18ed4b3a8cb37#file-trackingnumber-php-L17) method. Those modules can create a DOS attack on your MySQL server.

An unoptimized different example for fetching the tracking numbers shows:

```
<?php
class Vendor_GridActions_Block_Adminhtml_Sales_Order_Grid_Widget_Renderer_Trackingnumber extends Mage_Adminhtml_Block_Widget_Grid_Column_Renderer_Select
{
    protected $_column = false;

    public function render(Varien_Object $row)
    {
        if ($this->_column !== false) {
            $column = $this->_column;
        } else {
            $column = $this->getColumn();
        }
        #$colId = $column->getName() ? $column->getName() : $column->getId();
        $colId = 'tracking-input';
        $orderId = $row->getEntityId();
        $order = Mage::getModel('sales/order')->load($orderId);
        if (!$order->getId()) {
            return '';
        }

        $html = '';
        if ($order->canShip()) {
            $html = '<input name="' . $colId . '-' . $row->getId() . '" rel="' . $row->getId() . '" class="input-text ' . $colId . '"
                            value="' . $row->getData($column->getIndex()) . '" style="width:97%;" onclick="vendorOnClickJs(this)"/>';
        } else if (!$order->canShip() && $order->getStatus() !== Mage_Sales_Model_Order::STATE_CANCELED && $order->getStatus() !== Mage_Sales_Model_Order::STATE_CLOSED) {
            $trackingNumbers = array();
            if (Mage::helper('vendor/utils')->mageVersionCompare(Mage::getVersion(), '1.4.0.0', '>=')) {
                $trackingUrl = Mage::helper('shipping')->getTrackingPopupUrlBySalesModel($order);
            } else {
                $trackingUrl = Mage::helper('shipping')->getTrackingPopUpUrlByOrderId($order->getEntityId());
            }
            // Starting from Magento 1.6, the trackingnumber field has been renamed from number to track_number
            if (Mage::helper('vendor/utils')->mageVersionCompare(Mage::getVersion(), '1.6.0.0', '>=')) {
                $tracks = Mage::getModel('sales/order_shipment_track')
                    ->getCollection()
                    ->addAttributeToSelect('track_number')
                    ->setOrderFilter($row->getEntityId());
                foreach ($tracks as $track) {
                    $trackingNumbers[] = '<a href="#" onclick="popWin(\'' . $trackingUrl . '\',\'trackorder\',\'width=800,height=600,left=0,top=0,resizable=yes,scrollbars=yes\')" >' . $this->escapeHtml($track->getTrackNumber()) . '</a>';
                }
            } else {
                $tracks = Mage::getModel('sales/order_shipment_track')
                    ->getCollection()
                    ->addAttributeToSelect('number')
                    ->setOrderFilter($row->getEntityId());
                foreach ($tracks as $track) {
                    $trackingNumbers[] = '<a href="#" onclick="popWin(\'' . $trackingUrl . '\',\'trackorder\',\'width=800,height=600,left=0,top=0,resizable=yes,scrollbars=yes\')" >' . $this->escapeHtml($track->getNumber()) . '</a>';
                }
            }
            $html = implode(', ', $trackingNumbers);

            if (Mage::getStoreConfigFlag('gridactions/general/add_trackingnumber_from_grid_shipped')) {
                if (count($tracks) > 0) {
                    $html .= '<br/>';
                }
                $html .= '<input name="' . $colId . '-' . $row->getId() . '" rel="' . $row->getId() . '" class="input-text ' . $colId . '"
                            value="' . $row->getData($column->getIndex()) . '" style="width:97%;" onclick="vendorOnClickJs(this)"/>';
            }
        }

        return $html;
    }

    public function renderCombined($row, $column)
    {
        $this->_column = $column;
        return $this->render($row);
    }

    /*
     * Return dummy filter.
     */
    public function getFilter()
    {
        return false;
    }

    /* Fix for compatibility with Magento version <1.4 */
    public function escapeHtml($data, $allowedTags = null)
    {
        if (Mage::helper('vendor/utils')->mageVersionCompare(Mage::getVersion(), '1.4.0.0', '>=')) {
            return Mage::helper('core')->escapeHtml($data, $allowedTags);
        } else {
            return Mage::helper('core')->htmlEscape($data, $allowedTags);
        }
    }
}
```

**Have you spotted the worst parts?** 

1. Depsite the `$row` variable already contains the current slim order object, the full order will be loaded to get all data because `$row` contains only the data from the `order_grid` table. The full data of the order model is needed to calculate the `canShip()` flag. In my opinion the loading of the order is quite questionable. I would choose more JS code to add more tracking numbers to each order item.
2. The next strange code executes to load the collection to retrieve all shipping numbers for each order.
3. I'm not mentioning the overall bad OO style.

### Conflict free & less resource-hungry rewriting

Rewriting without any conflicts can only be done via listening to events with your observer.

To attach a column to the sales order grid we must listen to the event `adminhtml_block_html_before`:

```
<config>
    <adminhtml>
        <event>
            <adminhtml_block_html_before>
                <observers>
                    <zookalsales_extend_sales_order_grid_comment>
                        <class>zookalsales/observer_adminhtml_order_grid</class>
                        <method>addOrderCommentColumn</method>
                    </zookalsales_extend_sales_order_grid_comment>
                </observers>
            </adminhtml_block_html_before>
        </events>
    </adminhtml>
</config>
```

Only add the observer to the config->adminhtml section we don't need it in the global or frontend scope.

The downside is that our observer gets on every rendered adminhtml block triggered. The footprint will be minimal
once you implement the observer method correctly.

Our observer works as follows:

```
class Zookal_Sales_Model_Observer_Adminhtml_Order_Grid
{
    /**
     * @dispatch adminhtml_block_html_before
     *
     * @param Varien_Event_Observer $observer
     */
    public function addOrderCommentColumn(Varien_Event_Observer $observer)
    {
        /** @var Mage_Adminhtml_Block_Sales_Order_Grid $block */
        $block = $observer->get€vent()->getBlock();
        if (false === ($block instanceof Mage_Adminhtml_Block_Sales_Order_Grid)) {
            return; // return as early NO BIG IF constructs!
        }

        $block->addColumnAfter('order_comment', [
            'header'   => Mage::helper('zookalsales')->__('Comment'),
            'index'    => 'real_order_id',
            'renderer' => 'zookalsales/adminhtml_widget_grid_column_renderer_comment',
            'align'    => 'center',
            'filter'   => false,
            'sortable' => false
        ], 'status');
        $block->sortColumnByOrder();
    }
}
```

The key understanding is in the `renderer`. After I have refactored hundreds of those renderers
nearly no one knows that those renderers are [singleton classes](http://www.phptherightway.com/pages/Design-Patterns.html) (a class loaded only once).

In our class `Zookal_Sales_Block_Adminhtml_Widget_Grid_Column_Renderer_Comment` which
extends `Mage_Adminhtml_Block_Widget_Grid_Column_Renderer_Abstract` we override the method `setColumn()`.

```
    public function setColumn($column)
    {
        parent::setColumn($column);
        $this->_updateHistoryData();
        return $this;
    }
```

We cannot use `_construct()` from `Varien_Object` nor `__construct` because those two are too early executed and
the grid collection is not yet available.

How does the `_updateHistoryData()` method look like?

```
    protected $_hasHistory = [];

    protected function _updateHistoryData()
    {
        /** @var Mage_Sales_Model_Resource_Order_Grid_Collection $gridCollection */
        $gridCollection = $this->getColumn()->getGrid()->getCollection();
        $ids            = array_map('intval', $gridCollection->getColumnValues('entity_id'));

        /** @var Mage_Sales_Model_Resource_Order_Status_History_Collection $historyCollection */
        $historyCollection = Mage::getModel('sales/order_status_history')->getCollection();
        $historyCollection
            ->addFieldToFilter('parent_id', ['in' => $ids])
            ->addFieldToFilter('comment', ['notnull' => true])
            ->addFieldToFilter('comment', ['neq' => '']);
        // add more filters here for the $historyCollection

        /** @var Varien_Db_Select $select */
        $select = $historyCollection->getSelect();
        $select->reset(Zend_Db_Select::COLUMNS);
        $select->columns(['parent_id']);
        $select->group(['parent_id']);

        $this->_hasHistory = $gridCollection->getConnection()->fetchAssoc($select);
    }
```

The key to access the sales order grid collection is: `$this->getColumn()->getGrid()->getCollection()`.
With the already loaded collection you can run `getColumnValues()` on it to retrieve all order IDs. No DB access necessary! Of course I could further refactor the `_updateHistoryData ()` method.

The rest of the method is simply accessing the history table pulling out the parent_ids and registering
them in an internal array `_hasHistory`.

In our main `render()` method, which gets executed in EVERY row, we simply implement:

```
    public function render(Varien_Object $row)
    {
        /** @var $row Mage_Sales_Model_Order */

        if (!isset($this->_hasHistory[$row->getId()])) {
            return '';
        }
        return '<div class="zk-user-comment" data-url="' . $this->_getUrl($row) . '" title="Customer Comment"></div>';
    }
```

CSS class `.zk-user-comment` shows a nice icon and a prototypeJS event listener opens an inline popup
window to show all the comments related to this order.

It will be left as an exercise to the reader to implement this behaviour into his/her own store
instead of copying this code from GitHub. Some typos in the code are on purpose.

Final result which includes two controller actions and a little bit of JS and CSS. All components
are already in Magento available so no need to reinvent the whole stuff.

![Display order comment in sales order grid](/wp-content/uploads/order_comment.png "Display order comment")

## Magento 2 implementation

The same logic as above applies to Magento2 except for the JavaScript.

The column can be added this way:

File: `app/code/SchumacherFM/OrderComment/view/adminhtml/layout/sales_order_grid_block.xml`

```
<?xml version="1.0"?>
<page xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:noNamespaceSchemaLocation="../../../../../../../lib/internal/Magento/Framework/View/Layout/etc/page_configuration.xsd">
    <head>
        <css src="SchumacherFM_OrderComment::css/ordercomment.css"/>
        <link src="SchumacherFM_OrderComment::js/orderCommentBootStrap.js"/>
    </head>
    <body>
        <referenceBlock name="sales.order.grid.columnSet">

            <block class="Magento\Backend\Block\Widget\Grid\Column" after="status" as="sfm_order_comment">
                <arguments>
                    <argument name="header" xsi:type="string" translate="true">Comment</argument>
                    <argument name="index" xsi:type="string">real_order_id</argument>
                    <argument name="id" xsi:type="string">sfm_order_comment</argument>
                    <argument name="header_css_class" xsi:type="string">col-order-number</argument>
                    <argument name="column_css_class" xsi:type="string">col-order-number</argument>
                    <argument name="renderer" xsi:type="string">SchumacherFM\OrderComment\Block\Widget\Grid\Column\Renderer\OrderComment</argument>                    <argument name="filter" xsi:type="string">0</argument>
                    <argument name="sortable" xsi:type="string">0</argument>
                </arguments>
            </block>

        </referenceBlock>
    </body>
</page>
```

And the renderer looks nearly the same as for Magento1:

```
<?php

namespace SchumacherFM\OrderComment\Block\Widget\Grid\Column\Renderer;

class OrderComment extends \Magento\Backend\Block\Widget\Grid\Column\Renderer\AbstractRenderer
{

    /**
     * @var \Magento\Sales\Model\Resource\Order\Status\History\CollectionFactory
     */
    protected $_historyCollectionFactory;

    /**
     * @param \Magento\Backend\Block\Context $context
     * @param \Magento\Sales\Model\Resource\Order\Status\History\CollectionFactory $historyCollectionFactory
     * @param array $data
     */
    public function __construct(
        \Magento\Backend\Block\Context $context,
        \Magento\Sales\Model\Resource\Order\Status\History\CollectionFactory $historyCollectionFactory,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->_historyCollectionFactory = $historyCollectionFactory;
    }

    /**
     * @var array
     */
    protected $_hasHistory = [];

    protected function _updateHistoryData()
    {
        /** @var \Magento\Sales\Model\Resource\Order\Grid\Collection $gridCollection */
        $gridCollection = $this->getColumn()->getGrid()->getCollection();
        $ids = array_map('intval', $gridCollection->getColumnValues('entity_id'));

        /** @var \Magento\Sales\Model\Resource\Order\Status\History\Collection $historyCollection */
        $historyCollection = $this->_historyCollectionFactory->create();

        $historyCollection
            ->addFieldToFilter('parent_id', ['in' => $ids])
            ->addFieldToFilter('comment', ['notnull' => true])
            ->addFieldToFilter('comment', ['neq' => '']);
        // add more filters here for the $historyCollection

        /** @var \Magento\Framework\DB\Select $select */
        $select = $historyCollection->getSelect();
        $select->reset(\Magento\Framework\DB\Select::COLUMNS);
        $select->columns(['parent_id']);
        $select->group(['parent_id']);

        $this->_hasHistory = $gridCollection->getConnection()->fetchAssoc($select);
    }

    /**
     * @param \Magento\Backend\Block\Widget\Grid\Column $column
     * @return $this
     */
    public function setColumn($column)
    {
        parent::setColumn($column);
        $this->_updateHistoryData();
        return $this;
    }

    /**
     * @param \Magento\Framework\Object $row
     * @return string
     */
    public function render(\Magento\Framework\Object $row)
    {
        /** @var $row \Magento\Sales\Model\Order */

        if (!isset($this->_hasHistory[$row->getId()])) {
            return '';
        }
        return '<div class="zk-user-comment" data-order="' . $this->escapeHtml($row->getIncrementId()) . '"
        data-url="' . $this->escapeUrl($this->_getUrl($row)) . '" title="Customer Comment"></div>';
    }

    /**
     * @param \Magento\Sales\Model\Order $order
     *
     * @return string
     */
    protected function _getUrl(\Magento\Sales\Model\Order $order)
    {
        return $this->getUrl('*/ordercomments/comments', ['parent_id' => $order->getId()]);
    }
}
```

I had a tiny problem to get the requirejs stuff running but file `js/orderCommentBootStrap.js`
consists simply of that JS:

```
require([
    "SchumacherFM_OrderComment/js/orderComment"
]);
```

and the `js/orderComment.js` contains the logic:

```
define([
    "jquery"
], function (jQuery) {
    'use strict';

    jQuery('.zk-user-comment').each(function (k, element) {
        var $that = jQuery(this)

        $that.on('click', function (e) {
            e.stopPropagation();
            console.log('@todo open modal load data via URL', $that.data('url'), $that.data('order'))

        });
    });
});
```

Is there a better way for the Javascript to load and to avoid two files? 
Put all in one file?

I ran out of time for the final implementation of the controller to load the 
history of comments.

You can have a look on the files here: [https://github.com/SchumacherFM/magento2/commit/dad43804a39855a412c76485529d555be32101fc](https://github.com/SchumacherFM/magento2/commit/dad43804a39855a412c76485529d555be32101fc)

If there are more than four comments in the Disqus block then I'll 
outsource that module into its own repo
with fully functionality. :-)
