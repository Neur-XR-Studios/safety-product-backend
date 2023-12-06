const auth = require('../../middleware/auth');
const Company = require('../../model/schema/company');
const User = require('../../model/schema/user');
const bcrypt = require('bcrypt');
const activationCodedb = require('../../model/schema/activationCode')

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const query = { username };

    const result = await User.findOne(query).populate({
      path: 'company',
      populate: {
        path: 'products',
        model: 'TrainingType',
        select: 'name',
      },
    });


    // No record found for the given username
    if (!result) {
      return res.status(401).json({ message: "Incorrect Credentials" });
    }

    // User found
    const hashedPassword = result.password;
    let isPasswordCorrect;

    try {
      isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
      console.log(isPasswordCorrect);
    } catch (errBcrypt) {
      console.log(errBcrypt);
      return res.status(400).json({ message: "Error: Could not verify user password" });
    }

    // Wrong password given
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect Credentials" });
    }

    // User authenticated
    const user = result.toObject();
    delete user.password;

    const token = auth.issueToken(user);
    let companyname = "";
    let active = false;
    let products = [];

    if (user.company) {
      companyname = user.company.name || "";
      active = user.company.isSubscribed || false;
      products = user.company.products || [];
    }
    return res.status(200).json({
      message: "Login Success",
      data: {
        username: user.username,
        role: user.role,
        companyname,
        active,
        products
      },
      token
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const activationCode = async (req, res) => {
  try {
    const { activationCode } = req.body;
    const user = req.user;
    const companyID = user.company._id;

    const company = await Company.findById(companyID);

    if (company.isSubscribed) {
      return res.status(200).json({ message: "🔥🔥 Already subscribed 🔥🔥" });
    }

    const ActivationCode = company.activateCode;
    const isActivationCode = await activationCodedb.findOne({ code: activationCode });

    if (isActivationCode) {
      if (activationCode == isActivationCode.code && isActivationCode.isRedeemed === true) {
        return res.status(200).json({ message: "Code already redeemed" });
      }
    }


    if (activationCode === ActivationCode) {
      company.isSubscribed = true;
      company.lastActivationDate = new Date().toLocaleDateString('en-US');
      await activationCodedb.updateMany(
        { code: { $in: ActivationCode } },
        { $set: { isRedeemed: true } }
      );
      await company.save();
      return res.status(200).json({ message: "Code Activated" });
    } else {
      return res.status(200).json({ message: "Invalid Code" });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {
  login,
  activationCode
};