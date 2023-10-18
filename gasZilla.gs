
function test_gasZilla() {

  const targetFolder = 'gasZillaTest';  // no trailing '/' 
  /* path should exist in server side (relative to baseUrl) 
     e.g. https://www.example.com/test/fileZillaTest 
     Relative path notation is also allowed you can use
     targetFolder = '../fileZillaTest' to aim
     https://www.example.com/fileZillaTest
     targetFolder = '.' to aim
     https://www.example.com/ i.e. baseUrl
  */
  let fileBlob; // file will be created or overwitten based on file name
  if (false) {
    const fileID = '<any drive file ID to test>';
    fileBlob = DriveApp.getFileById(fileID).getBlob();
  } else {
    const txtContent = 'Te traje una Lola.'
    fileBlob = Utilities.newBlob(txtContent);
    fileBlob.setName('Hola Manola.txt');
    fileBlob.setContentTypeFromExtension();
  }

  const reta = gasZillaSendFile(fileBlob, targetFolder);
    /*
    reta[0]:
        0: OK!
        -1: managed error
        -2; possible hash mismatch (due to network delay or timezone issue). 
            No information was intentionally leaked from PHP in order to 
            minimize clues during unauthorized access.

    reta[1]: human readable information
    */
  console.log('result:', reta[0]);
  console.log('HRI:', reta[1]);
}


function gasZillaSendFile(fileBlob, targetFolder) {

  const baseUrl = 'https://www.example.com/test';  // no trailing '/'
  // baseUrl is the place where gasZillaPhpFile is located
  const gasZillaPhpFileName = 'gasZilla_phpUpld';  // no trailing '.php'


  const fetchOptions = {
    //'muteHttpExceptions': true,
    method: 'POST',
    payload: { postdFile: fileBlob }
  };

  const response = UrlFetchApp.fetch(baseUrl + '/' + gasZillaPhpFileName + '.php?valid=' + generateOTHash() + '&dest=' + targetFolder, fetchOptions);

  const rCode = response.getResponseCode();
  
  if (rCode === 200) {
    let ret = 0;
    const rText = response.getContentText();

    if ( rText === '' ) ret = -2;
    else if ( rText !== 'File was successfully uploaded.' ) ret = -1;  // managed error
    /*
        ret:
        0: OK!
       -1: managed error
       -2; possible hash mismatch (due to network delay or timezone issue). 
           No information was intentionally leaked from PHP in order to 
           minimize clues during unauthorized access.
    */
    return [ret,rText];
  } else {
    // fetch error handling
    let myName = arguments.callee.toString();
    myName = myName.substring('function '.length);
    myName = myName.substring(0, myName.indexOf('{')).trim();
    throw new Error(myName + " " + rCode + "\n\n" + response.getContentText());
  }
}


function generateOTHash() {

  const secretKey = "<Replace with your own arbitrary key shared between both hash generator functions>";
  const timeGap = 5; //time window to validate in seconds, should be the same in both hash functions

  const timestamp = ~~(Date.now() / (1000 * timeGap));
  const dataToHash = secretKey + timestamp;

  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, dataToHash);
  const hash = bytes.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');

  return hash;
}
