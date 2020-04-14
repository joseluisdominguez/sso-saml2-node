// https://www.npmjs.com/package/saml2-js
const saml2 = require('saml2-js');
const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Service Provider options
const sp_options = {
  entity_id: "loud",
  private_key: fs.readFileSync("certs/private-sp-1.pem").toString(),
  certificate: fs.readFileSync("certs/public-sp-1.pem").toString(),
  assert_endpoint: "https://localhost:4001/assert",
  force_authn: false,
  auth_context: { comparison: "exact", class_refs: ["urn:oasis:names:tc:SAML:1.0:am:password"] },
  nameid_format: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
  sign_get_request: false,
  allow_unencrypted_assertion: true
}

// Idp Options
const idp_options = {
  sso_login_url: "https://localhost:9443/samlsso",
  sso_logout_url: "https://localhost:9443/samlsso",
  certificates: [fs.readFileSync("certs/public-Idp.pem").toString()],
  force_authn: false,
  sign_get_request: false,
  allow_unencrypted_assertion: true
};

// Create SP instance
var sp = new saml2.ServiceProvider(sp_options);
// Create idp instance
var idp = new saml2.IdentityProvider(idp_options);

// Show metada info SP
// const metada = sp.create_metadata();
// console.log(metada)

// Create login url with idp host
sp.create_login_request_url(idp, {}, (error, login_url, request_id) => {
  console.log(login_url)
});

// Home endpoint after login (Idp redirect this URL)
app.post('/assert', function (req, res) {
  // console.log(req.body)
  sp.post_assert(idp, { request_body:req.body }, (error, response) => {
    console.log(response)
    res.send('Hello World!');
  });
});

// Init secure server
https.createServer({
  key: fs.readFileSync('certs/server.key'),
  cert: fs.readFileSync('certs/server.cert')
}, app)
.listen(4001, function () {
  console.log('Example app listening on port 4001! Go to https://localhost:4001/')
})