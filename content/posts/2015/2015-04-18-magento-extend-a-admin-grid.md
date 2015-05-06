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

A new requirement for one of the stores I take care of was to extend the sales order grid
with the new column "order comments" aka. order status history.

Another Magento store already implemented that feature so I dig deeper to found out that 
the used module is this one: [https://github.com/magemaven/magento-order-comment](https://github.com/magemaven/magento-order-comment).

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

### Conflict free rewriting

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
        $block = $observer->getEvent()->getBlock();
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
        $block->sortColumnsByOrder();
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
    /**
     * @var array
     */
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
The collection is already loaded so you can run `getColumnValues()` on it to retrieve all order IDs.
Not DB access necessary!

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
instead of copying this code from GitHub.

## Magento 2 implementation

@todo
