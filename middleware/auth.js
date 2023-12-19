const { log } = require("forever");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const _SecretToken = process.env.TOKEN_SECRET;
const _TokenExpiryTime = "365d";

exports.authorize = function (roles = []) {
  if (!Array.isArray(roles)) roles = [roles];

  return async (req, res, next) => {
    function sendError(msg) {
      return res.status(403).json({
        message: msg,
      });
    }

    try {
      const token = req.headers["Authorization"] || req.headers["authorization"];

      if (!token) return sendError("Error: No Token");
      if (token.indexOf("Bearer") !== 0) return sendError("Error: Token format invalid");

      const tokenString = token.split(" ")[1];
      jwt.verify(tokenString, _SecretToken, async (err, decodedToken) => {
        if (err) {
          console.log(err);
          return sendError("Error: Broken Or Expired Token");
        }

        if (!decodedToken.role) return sendError("Error: Role missing");
        const userRole = decodedToken.role;

        // Check if the user has the role "superadmin" and is_superadmin is true
        if (exports.Roles.superAdmin.includes(userRole) && decodedToken.is_superadmin) {
          req.user = decodedToken;
          return next();
        }

        // Check if the user has an admin role
        if (userRole === "admin") {

          if (req.path === "/activation") {
            req.user = decodedToken;
            return next();
          }
          const isSubscribed = await checkAdminSubscription(decodedToken.company);

          if (!isSubscribed) {
            // return sendError("Error: Activate your subscription");
            return res.status(422).json({ message: "Activate your subscription", subscription: false });
          }
        }

        req.user = decodedToken;
        next();
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Server Error Occurred" });
    }
  };
};


async function checkAdminSubscription(companyId) {
  try {
    const Company = require('../model/schema/company');

    const company = await Company.findById(companyId);

    return company.isSubscribed;
  } catch (error) {
    console.error('Error checking admin subscription:', error);
    return false;
  }
}

exports.issueToken = function (user) {
  var token = jwt.sign({ ...user, iss: "Node-Auth" }, _SecretToken, {
    expiresIn: _TokenExpiryTime,
  });
  return token;
};

exports.Roles = {
  superAdmin: ["superadmin"],
  Admin: ["admin"],
  All: ["user", "admin"],
};
