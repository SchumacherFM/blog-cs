---
title: Magento PGP
author: Cyrill
date: 2013-07-23
disqus_identifier: /2013/07/23/magepgp/
categories:
  - Projects
tags:
  - Magento
  - PGP
---

Secure emails in Magento via PGP / GPG email encryption. Customers and shop owners can upload 
their public key and each email sent to their address will be automatically encrypted.

<!--more-->

{{% hubinfo u="SchumacherFM" r="Magento-PGP" c="5" %}}

![image](https://raw.github.com/SchumacherFM/Magento-PGP/master/logo/magento-pgp.png)

Secure emails in Magento via PGP / GPG email encryption.

Customers and shop owners can upload their public key and each email sent to their address will be automatically encrypted.
That means if an email will leave the webserver via Magento this module will lookup via email address for a public key in the database
and encrypts the email before it will be sent out.

If an email has multiple recipients then the email will be encrypted with the key from the first recipient.

This module uses:

- PHP based https://github.com/jasonhinkle/php-gpg, if your hosting provider has disabled exec()
- CLI based [http://pear.php.net/package/Crypt_GPG] [PEAR SVN](https://svn.php.net/repository/pear/packages/Crypt_GPG) via the native gpg installation

[https://prism-break.org/#email-encryption](https://prism-break.org/#email-encryption)

What is PGP?
------------

[http://en.wikipedia.org/wiki/Public-key_cryptography](http://en.wikipedia.org/wiki/Public-key_cryptography)
Public-key cryptography refers to a cryptographic system requiring two separate keys, one of which is secret and one of which is public. Although different, the two parts of the key pair are mathematically linked. One key locks or encrypts the plaintext, and the other unlocks or decrypts the ciphertext. Neither key can perform both functions by itself. The public key may be published without compromising security, while the private key must not be revealed to anyone not authorized to read the messages.

Restrictions
------------

Sending of pure HTML emails is not possible ... ok it is ... but there needs to be mayor refactorings
of the Zend_Mail classes. Due to the different Magento and Zend versions this could be quite a challange.

At the moment I have implemented a PHP class [https://github.com/mtibben/html2text] which converts HTML into plain text.
This plain text lacks only of nice output tables ... so I am still looking for a good PHP based HTML to text converter.

The PHP based gpg module cannot handle comments in a key. So please remove comments before submitting a key.
The CLI based gpg module has no restrictions.

Used Versions
-------------

- Crypt_GPG-1.4.0b4.tgz
- https://github.com/jasonhinkle/php-gpg/commit/985bcdbfc16fb839d833d33a8f4c6057e621fbfe

Todo
----

- translations
- sign
- sign and encrypt
- if an email has multiple recipients sent out for each recipient an encrypted mail.

API
---

If there is a key in the database:

```
/** @var $pgp SchumacherFM_Pgp_Model_Pgp */
$pgp = Mage::getModel('pgp/pgp')
    ->setPlainTextString($text)
    ->setEmailAddress($emailAddressForEncryption);

$encrypted = $pgp->encrypt()->getEncrypted();
```

Import a key:

```
/** @var SchumacherFM_Pgp_Model_Pgp $pgp */
$pgp = Mage::getModel('pgp/pgp', array(
    'publicKeyAscii' => $publicKey,
));

$pgpDetails = $pgp->getPublicKeyDetails();
```

Both methods can also be combined.

Printscreens
------------

### Frontend customer account section

![image](https://raw.github.com/SchumacherFM/Magento-PGP/master/doc/fe_customer_key_edit.png)

### Backend System Configuration

![image](https://raw.github.com/SchumacherFM/Magento-PGP/master/doc/be_config.png)

### Backend PGP Key Management (List)

![image](https://raw.github.com/SchumacherFM/Magento-PGP/master/doc/be_key_list.png)

### Backend PGP Key Management (Edit)

![image](https://raw.github.com/SchumacherFM/Magento-PGP/master/doc/be_key_edit.png)

