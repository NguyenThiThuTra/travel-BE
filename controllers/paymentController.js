function sortObject(obj) {
  var sorted = {};
  var str = [];
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

exports.createVNPayment = async (req, res, next) => {
  var ipAddr =
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  var config = require('config');
  var dateFormat = require('dateformat');

  var tmnCode = config.get('vnp_TmnCode');
  var secretKey = config.get('vnp_HashSecret');
  var vnpUrl = config.get('vnp_Url');
  var returnUrl = config.get('vnp_ReturnUrl');
  var date = new Date();

  var createDate = dateFormat(date, 'yyyymmddHHmmss');
  var orderId = dateFormat(date, 'HHmmss');
  var amount = req.body.amount;
  var bankCode = req.body.bankCode;

  var orderInfo = req.body.orderDescription;
  var orderType = req.body.orderType;
  var locale = req.body.language;
  if (locale === null || locale === '') {
    locale = 'vn';
  }
  var currCode = 'VND';
  var vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  // vnp_Params['vnp_Merchant'] = ''
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = orderType;
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  if (bankCode !== null && bankCode !== '') {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  var querystring = require('qs');
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var crypto = require('crypto');
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
  // res.redirect(vnpUrl);
  res.status(200).json({
    status: 'success',
    vnpUrl,
  });
};

exports.returnVNPayment = async (req, res, next) => {
  var vnp_Params = req.query;

  var secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);

  var config = require('config');
  var tmnCode = config.get('vnp_TmnCode');
  var secretKey = config.get('vnp_HashSecret');

  var querystring = require('qs');
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var crypto = require('crypto');
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

    res.status(200).json({
      status: 'success',
      code: vnp_Params['vnp_ResponseCode'],
    });
  } else {
    res.status(200).json({
      status: 'success',
      code: '97',
    });
  }
};

exports.ipnVNPayment = async (req, res, next) => {
  var vnp_Params = req.query;
  console.log({req:req.query})
  var secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  var config = require('config');
  var secretKey = config.get('vnp_HashSecret');
  var querystring = require('qs');
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var crypto = require('crypto');
  var hmac = crypto.createHmac('sha512', secretKey);
  var signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

  if (secureHash === signed) {
    var orderId = vnp_Params['vnp_TxnRef'];
    var rspCode = vnp_Params['vnp_ResponseCode'];
    //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
    res.status(200).json({
      status: 'success',
      RspCode: '00',
      Message: 'success',
    });
  } else {
    res.status(200).json({
      status: 'success',
      RspCode: '97',
      Message: 'Fail checksum',
    });
  }
};

exports.callbackVNPayment = async (req, res, next) => {
  // res.redirect(vnpUrl);
  res.status(200).json({
    status: 'success',
  });
};

exports.checkVNPayment = async (req, res, next) => {
  // res.redirect(vnpUrl);
  res.status(200).json({
    status: 'success',
  });
};

exports.cancelVNPayment = async (req, res, next) => {
  // res.redirect(vnpUrl);
  res.status(200).json({
    status: 'success',
  });
};

exports.refundVNPayment = async (req, res, next) => {
  // res.redirect(vnpUrl);
  res.status(200).json({
    status: 'success',
  });
};

exports.queryVNPayment = async (req, res, next) => {
  // res.redirect(vnpUrl);
  res.status(200).json({
    status: 'success',
  });
};
