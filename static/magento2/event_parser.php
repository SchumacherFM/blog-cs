<?php
/*
find ~/Sites/magento2/site -type f -name "*.js" | xargs pcregrep -i -M -n -e 'varienGlobalEvents.fireEvent\([^;]+\);' > events_js.txt
find ~/Sites/magento2/site/app -type f -name "*.php" | xargs pcregrep -i -M -n -e '->dispatch\([^;]+\);' > events_app.txt
find ~/Sites/magento2/site/lib -type f -name "*.php" | xargs pcregrep -i -M -n -e '->dispatch\([^;]+\);' > events_lib.txt

find ~/Sites/magento2/site/app -type f -name "*.php" | xargs pcregrep -i -M -n -e 'coreRegistry\s*->\s*register\([^;]+\);' > register_app.txt
find ~/Sites/magento2/site/app -type f -name "*.php" | xargs pcregrep -i -M -n -e '_registry\s*->\s*register\([^;]+\);' >> register_app.txt
find ~/Sites/magento2/site/app -type f -name "*.php" | xargs pcregrep -i -M -n -e 'get\(.Magento\\Framework\\Registry.\)->register\([^;]+\);' >> register_app.txt

 */

if (!isset($argv[1])) {
    die("ARG 1 is missing\n");
}
$file = $argv[1];

$fContent = file_get_contents($file);

$fc = explode(');', $fContent);


foreach ($fc as $event) {
    $event = trim($event) . ');';
    $lineEvent = explode(':', $event);
    $fileName = substr(trim($lineEvent[0]), 5);
    if (!isset($lineEvent[2])) {
        continue;
    }
    $lineNumber = trim($lineEvent[1]);
    $eventCode = str_replace('"', '\'', $lineEvent[2]);
    $precedingWS = [];
    preg_match('~^(\s+)~', $eventCode, $precedingWS);
    if (isset($precedingWS[1]) && strlen($precedingWS[1]) > 2) {
        $eventCode = str_replace($precedingWS[1], '', $eventCode);
    }

    $eventNames = [];
    preg_match('~\'([\w]+)\'\s*(,|\)|\.)~i', $eventCode, $eventNames);

    $en = isset($eventNames[1]) ? $eventNames[1] : 'NO_MATCH';


    echo '"' . implode('"|"', [$fileName, $lineNumber, $en, $eventCode]) . '"' . "\n";
}
