<?php

function generateHash() {
    define("SECRETKEY", "<Replace with your own arbitrary key shared between both hash generator functions>");
    define("TIMEGAP", 5); //time window to validate in seconds should, be the same in both hash functions
    $dataToHash = SECRETKEY . (int) (time()/TIMEGAP);
    $hash = hash('sha256', $dataToHash);
    return $hash;
}

$hash = generateHash();

    if ( $_GET[valid] == $hash ) {

      $uploadfile = $_GET[dest].'/'. basename($_FILES['postdFile']['name']);

      if (move_uploaded_file($_FILES['postdFile']['tmp_name'], $uploadfile)) {

        echo "File was successfully uploaded.";
      } else {

        echo "Failed.\n";
        $errArray = error_get_last();
        echo $errArray[message]."\n";
        echo "Line ".$errArray[line]." of ".$errArray[file];
      }
    }
?>
