var XBOX_VENDOR_ID = 1118;
var XBOX_PRODUCT_ID = 1817;
var DEVICE_INFO = {"vendorId": XBOX_VENDOR_ID, "productId": XBOX_PRODUCT_ID};

var xboxController;
var usb = chrome.usb;
var transfer = {
  "direction": "in",
  "endpoint": 3,
  "length": 32
};

var requestButton = document.getElementById("requestPermission");
var permissionObj = {permissions: [{'usbDevices': [DEVICE_INFO] }]};

var onEvent = function(usbEvent) {
  console.log("usbEvent: ", usbEvent)
  if (usbEvent.resultCode) {
    console.log("Error: " + usbEvent.error);
    return;
  }

  var buffer = new Int8Array(usbEvent.data);

  console.log(buffer)

  usb.interruptTransfer( xboxController, transfer, onEvent );
}

var gotPermission = function() {
  requestButton.style.display = 'none';
  console.log('App was granted the "usbDevices" permission.');
  usb.findDevices( DEVICE_INFO,
    function(devices) {
      if (!devices || !devices.length) {
        console.log('device not found');
        return;
      }
      console.log(devices)
      console.log('Found device: ' + devices[0].handle);
      xboxController = devices[0];
      usb.interruptTransfer(xboxController, transfer, onEvent);
    });
};

requestButton.addEventListener('click', function() {
	chrome.permissions.request( permissionObj, function(result) {
		if (result) {
			gotPermission();
		} else {
			console.log('App was not granted the "usbDevices" permission.');
      console.log(chrome.runtime.lastError);
		}
	});
});

// NOTE: Confusing. What's going on here?
chrome.permissions.contains( permissionObj, function(result) {
  if (result) {
    gotPermission();
  }
});
