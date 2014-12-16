---
title: Magento Grid Column Renderer
author: Cyrill
date: 2014-12-16
disqus_identifier: /2014/12/16/magegridcolumnrenderer/
categories:
  - Thoughts
tags:
  - Magento
  - Coding
  - "Bad Code"
---

Today I've found weird piece of code in `NameSpace_Module_Block_Product_Widget_Grid_Column_Renderer_PreparationWarehouse` which affects extremely performance when loading a grid in the backend.

<!--more-->

```
class NameSpace_Module_Block_Product_Widget_Grid_Column_Renderer_PreparationWarehouse extends
    Mage_Adminhtml_Block_Widget_Grid_Column_Renderer_Abstract
{
    public function render(Varien_Object $row)
    {
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

