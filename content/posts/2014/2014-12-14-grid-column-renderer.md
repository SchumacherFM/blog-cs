---
title: Magento Grid Column Renderer with DB queries
author: Cyrill
date: 2014-12-16
categories:
  - Thoughts
tags:
  - Magento
  - Coding
  - Refactoring
---

Today I've found weird piece of code in `NameSpace_Module_Block_Product_Widget_Grid_Column_Renderer_PreparationWarehouse` 
which affects extremely performance when loading a grid in the backend.

<!--more-->

The grid was used to display the history of sales orders with all items per order. From the order head only 10 different
columns had been used but from the sales order item lot of more columns were needed.

For each sales order item column the previous authors have created a custom renderer and each renderer loaded
the sales order item object depending on the parent sales order. There was no sharing per line.
So you can figure out that per line for nearly each column there was a DB query ...

```
class NameSpace_Module_Block_Product_Edit_Tabs_SalesHistoryOrdersGrid 
    extends Mage_Adminhtml_Block_Widget_Grid
{
    protected function _prepareColumns()
    {
	  // more column definitions
	  
        $this->addColumn('preparation_warehouse', array(
            'header'     => Mage::helper('Module')->__('Preparation<br>Warehouses'),
            'index'      => 'preparation_warehouse',
            'product_id' => $this->_getProduct()->getId(),
            'field_name' => 'preparation_warehouse',
            'renderer'   => 'Module/product_widget_grid_column_renderer_preparationWarehouse',
            'align'      => 'center',
            'filter'     => false,
            'sortable'   => false
        ));

```

Here is the renderer:

```
class NameSpace_Module_Block_Product_Widget_Grid_Column_Renderer_PreparationWarehouse extends
    Mage_Adminhtml_Block_Widget_Grid_Column_Renderer_Abstract
{
    public function render(Varien_Object $row)
    {
        /** @var $row NameSpace_Module_Model_Sales_Order */
        $html      = '';
        $orderId   = $row->getId();
        $productId = $this->getColumn()->getproduct_id();

        $orderItem = Mage::getModel('sales/order_item')
            ->getCollection()
            ->addFieldToFilter('order_id', $orderId)
            ->addFieldToFilter('product_id', $productId)
            ->getFirstitem();

        $orderItemId = $orderItem->getId();

        $item                     = Mage::getModel('Module/SalesFlatOrderItem')->load($orderItemId);
        $preparationWarehouseCode = $item->getpreparation_warehouse();
        if ($preparationWarehouseCode) {
            $preparationWarehouse = Mage::getModel('Module/Warehouse')->load($preparationWarehouseCode);
            $html .= $preparationWarehouse->getstock_name();
        } else
            $html .= '<font color="red">' . $this->__('Undefined') . '</font>';

        return $html;
    }
}
```

A little explanation before we figure out what is wrong here:

The `PreparationWarehouse` is saved per `sales/order_item` because one order item can be shipped 
from a different warehouse.

The entity `Module/SalesFlatOrderItem` is an additional table which extends in a very very bad way 
the `sales_flat_order_item` table/entity. 

During my helicopter code review I've figured out that the whole grid implementation was screwed up.

After refactoring of `NameSpace_Module_Block_Product_Edit_Tabs_SalesHistoryOrdersGrid` I've completely 
deleted the column renderer `PreparationWarehouse` and many other renderers. 

The `SalesHistoryOrdersGrid` relied on only 10 different columns on the `sales/order` table but more 
DB retrieval work has been done in all the column renderers. 

The `PreparationWarehouse` was the worst one of all.

After switching the collection in the `SalesHistoryOrdersGrid` to 

```
        $this->_collection = Mage::getModel('sales/order_item')->getCollection();
        $this->_collection->join(
            ['so' => 'sales/order'],
            'main_table.order_id = so.entity_id AND main_table.product_id = ' . $this->_getProduct()->getId(),
            [
                'increment_id',
                'so_created_at' => 'so.created_at',
                'grand_total',
                'order_currency_code',
                'customer_id',
                'customer_firstname',
                'customer_lastname',
                'is_valid',
                'status',
                'state',
            ]
        );
```

all column renderers can now be removed and a simple option list or even the default text fields have been reimplemented.
