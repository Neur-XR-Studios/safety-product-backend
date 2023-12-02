const auth = require('../../middleware/auth')
const User = require('../../model/schema/user');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const query = { username };

    const result = await User.findOne(query);

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
    return res.status(200).json({ message: "Login Success", data: { username: user.username, role: user.role }, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



module.exports = {
  login
};