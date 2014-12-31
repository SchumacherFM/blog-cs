---
title: Magento2 - List of all coreRegistry register calls
author: Cyrill
date: 2015-01-01
disqus_identifier: /2015/01/01/mage2-coreRegistry/
categories:
  - Thoughts
tags:
  - Magento2
  - Dispatched Events
url: magento2-list-of-all-register-calls  
---

This on going updated post which lists all calls to `coreRegistry->register()` in Magento2.

Current version: 0.42.0-beta2

<!--more-->

### Why is this useful?

If you want to extend any block, model, helper or listen to a specific event you might likely need to use
the current product, category, cms page, cms block, order, quote, etc. model.

I've seen a lot of bad written Magento1 code where developers instantiated over and over again new
objects of already available objects only to access a few properties. This slows down everything.

After you have identified your event or figured out where to integrate the plugin for the integration calls
you should figure out the current route and check here if the main object is globally available in the registry.

The registry acts as a message channel between different objects/areas. It lets you communicate data from the
controller to a helper, a block or another model. Of course you can communicate in any direction.

If you want to create registry entries for your modules, please do not abuse the registry for simple values. 
Create your own objects and share them via singleton patterns.

### How can I use this feature in my code?

Here is an example code on how to use the coreRegistry. This fictional class creates
new tabs in the catalog/category section. Each tab lists the best sold products per category.

The registry entry will be created here: 
[app/code/Magento/Catalog/Controller/Adminhtml/Category.php#L67](https://github.com/magento/magento2/blob/master/app/code/Magento/Catalog/Controller/Adminhtml/Category.php#L67)

```
namespace MyNamespace\MyModule\Block\Adminhtml\CategorySales;

class BestSalesTabs extends \Magento\Backend\Block\Widget\Tabs
{

    /**
     * Core registry
     *
     * @var \Magento\Framework\Registry|null
     */
    protected $_coreRegistry = null;

    /**
     * @param \Magento\Backend\Block\Template\Context $context
     * @param \Magento\Framework\Json\EncoderInterface $jsonEncoder
     * @param \Magento\Backend\Model\Auth\Session $authSession
     * @param \Magento\Framework\Registry $registry
     * @param array $data
     */
    public function __construct(
        \Magento\Backend\Block\Template\Context $context,
        \Magento\Framework\Json\EncoderInterface $jsonEncoder,
        \Magento\Backend\Model\Auth\Session $authSession,
        \Magento\Framework\Registry $registry,
        array $data = []
    ) {
        $this->_coreRegistry = $registry;
        parent::__construct($context, $jsonEncoder, $authSession, $data);
    }

    /**
     * Retrieve category object
     *
     * @return \Magento\Catalog\Model\Category
     */
    public function getCategory()
    {
        return $this->_coreRegistry->registry('current_category');
    }

    /**
     * Prepare Layout Content
     *
     * @return $this
     */
    protected function _prepareLayout()
    {
        $categoryAttributes = $this->getCategory()->getAttributes();
        if (!$this->getCategory()->getId()) {
    ...
```

You can also access the registry via the objectManager:

```
$this->_objectManager->get('Magento\Framework\Registry')->registry('current_category');
```

Please use your browsers search function!

{{< mage2_events url="static/magento2/register_app.csv" sep="|" >}}
