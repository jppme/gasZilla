# gasZilla

A server/client piece of code to upload files to a remote web server from Google Apps Script

## What you get

Two pieces of code, one to upload into your web server (with PHP capabilities), and another to integrate into any Google Apps Script project.

The goal is to have a way to upload files into your web server right from GAS

I guess there are a lot of situations where this is useful. In my case, this allows me to keep updated some data indicators in a website with information that comes from a Google Sheet. A script rewrites some files (recreate and upload them) that updates the site when needed without human intervention ;-) Everybody is happy, company employees do what they know to do with the information on Drive (for their own purposes) and a demon collects the data needed to keep updated the site.

This ultra simple code allows to upload an *on the fly* programmatically builded text file, and also can handle other documents like images, pdf files, etc. as long as they are accessible from a google apps script (i.e. in the Google Drive) which probably is a common situation in companies who adopted Google Workspace as main platform (for good or for bad).

The connection is secured with a one time hash key to keep the site from unauthorized access. Surelly there is a lot of security to add, e.g. write the php to avoid access to some folders or file names, but (for now) that is out of the scope of this ~~project~~ idea. 

## How to get it

First you need to define some constants and names to personalize the project, more personalization, more secure will be. 

Some values <u>must</u> be changed, you need to let the code know where your site is hosted! but, it may be a good practice to make some extra changes like change the name of your php file, set a personal secretKey, and maybe tune the _time to live_ of the hash.

Once done, just upload the php into your site and create a project with the gasZilla.gs (or embed it into an existing project) and start to play with it. A `test_gasZilla` function which covers the basics is available.

#### What to setup and where to make the changes.

- In **gasZilla.gs**
  
  - in `gasZillaSendFile` function
    
    - Set the `baseUrl` constant (where the php code will be uploaded) without trailing "/"
      
    - If you choose to change the php file name from the original **gasZilla_phpUpld.php** to any other arbitrary name, just set the `gasZillaPhpFileName` constant with the new name, don't include ".php", just the file name without the extension.
      
  - in `generateOTHash` function
    
    - Set a new secret key setting `secretKey` constant with any arbitrary string. *"\<Replace with your own arbitrary key shared between both hash generator functions\>"* will do the work but I encourage you to change it. This key, <u>the same one</u>, must be set into the php as `SECRETKEY` constant.
    - Set the time to live for the hash changing the `timeGap` value, or leave it with the default value, and change it if you have problems using gasZilla in your particular implemetation. This time to live, <u>the same one</u>, must be set into the php as `TIMEGAP` constant.
- in the **web server**
  
  - in the php file (named as the value of `gasZillaPhpFileName` constant in `gasZillaSendFile` function)
    
    - Set `SECRETKEY` constant with the same key set on **gasZilla.gs** `generateOTHash` function `secretKey` constant
    - Set `TIMEGAP` constant with the same value set on **gasZilla.gs** `generateOTHash` function `timeGap` value
  - upload the php file to be accessible in the url set in `baseUrl` constant in **gasZilla.gs** `gasZillaSendFile` function `baseUrl` constant
    

That's it.

So you got it! Now... 

## How to use it

You've got a function in **gasZilla.gs**, `test_gasZilla()`that you can use to get your first try to gasZilla invoking `gasZillaSendFile(fileBlob, targetFolder)`function.

The core of gasZilla is the `gasZillaSendFile(fileBlob, targetFolder)` function.

The `targetFolder` is relative to `baseUrl`, if you will upload your file to `baseUrl` itself (the folder where the php is hosted) just use `'.'` as `targetFolder`, if not, be sure that the chosen folder exists in the host. 

The file should be passed as blob, by `fileBlob`, getting the blob from the [Drive](https://developers.google.com/apps-script/reference/drive/drive-app#getfilebyidid) or creating one with [Utilities newBlob](https://developers.google.com/apps-script/reference/utilities/utilities#newblobdata).

`gasZillaSendFile` returns an array with two elements, the first is a number, the second, eventually, some text.

<u>Index 0 </u>is a number:

-  ` 0: OK!`
  
- `-1: error managed`
  
- `-2; error unmanaged`
  

<u>Index 1</u> is a human readable text string if the result is ok or a managed error, but in the unmanaged error case is just an empty string.

The unmanaged case (possibly a hash mismatch due to network delay or timezone issue) returns an empty string to minimize clues in case of unauthorized access attempts to the php.

If you get -2 returns, first double check `SECRETKEY`, `secretKey` and `TIMEGAP`, `timeGap` equality. Then try to increase the `timeGap` <u>and</u> `TIMEGAP` values (in `generateOTHash` function and the php file) Remember must be the same value on both sides.

If you are still in the blind lane... `print_r($_FILES);` and `print_r($_GET);` can help to debug the php side.
