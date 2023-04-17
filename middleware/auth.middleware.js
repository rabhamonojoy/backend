const jwt = require("jsonwebtoken");
const { Blacklist } = require("../model/blacklist.model");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const auth = async (req, res, next) => {
  
  const { evaAccessToken } = req.cookies;
  const isTokenBlacklisted = await Blacklist.findOne({ token: evaAccessToken });
  if (isTokenBlacklisted)
    return res.status(400).send({ msg: "Please login" });

  jwt.verify(
    evaAccessToken,
    "jwtsecretkey",
    async (err, decoded) => {
      if (err) {
        if (err.message === "jwt expired") {
          const newAccessToken = await fetch(
            "http://localhost:4500/refresh-token",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: req.cookies.evaRefreshToken,
              },
            }
          ).then((res) => res.json());
          res.cookie("evaAccessToken",newAccessToken,{maxAge:2000*60});
          next();
        }
      } else {
        console.log(decoded);
        next();
      }
    }
  );
};

module.exports = {auth}