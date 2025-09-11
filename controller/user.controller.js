import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";

import User from "../Models/user.model.js";
import Token from "../Models/token.model.js";

dotenv.config();

  // SIGNUP CONTROLLER 
export const signupUser = async (req, res) => {
  try {
    console.log("SIGNUP attempt:", { body: req.body });
    const hashedPassword = await bcryptjs.hash(req.body.password, 10);
    console.log("hashedPassword created");

    const user = {
      email: req.body.email,
      name: req.body.name,
      password: hashedPassword,
    };
    const newUser = new User(user);
    const saved = await newUser.save();
    console.log("user saved:", saved._id);
    return res.status(200).json({ msg: "SignUp Successful", id: saved._id });
  } catch (error) {
    console.error("Error while Signing Up:", error);
    return res
      .status(500)
      .json({ msg: "Error in SignUp", error: String(error) });
  }
};
// LOGIN CONTROLLER 
export const loginUser = async (req, res) => {
  let user = await User.findOne({ email: req.body.email }); //returns full object from the db, if it exists
  if (!user) {
    return res.status(400).json({ msg: "email does not match" });
  }

  try {
    let match = await bcryptjs.compare(req.body.password, user.password);
    if (match) {
      const accessToken = jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        process.env.ACCESS_SECRET_KEY,
        { expiresIn: "5d" }

        /* user.toJSON(),
        process.env.ACCESS_SECRET_KEY,
        { expiresIn: "5d" }
          this is for if one usr can see the oters post ie notes also 
        */
      );
      const refreshToken = jwt.sign(
        // user.toJSON(),
        { id: user._id, email: user.email },
        process.env.REFRESH_SECRET_KEY
      );

      const newToken = new Token({ token: refreshToken });
      await newToken.save(); // when me  want to logout (ie delete the refresh  token ) this  can look up the token and revoke it(though not  mandatory to have presence of the token it may been expired at this poing  of time .....!).

      return res.status(200).json({
        accessToken: accessToken,
        refreshToken: refreshToken,
        name: user.name,
        email: user.email,
      });
    } else {
      return res.status(400).json({ msg: "Password does not match" });
    }
  } catch (error) {
    console.log("Error while login in user:", error);
    return res.status(500).json({ msg: "Error while login in user" });
  }
};
// LOGOUT CONTROLLER 
export const logoutUser = async (req, res) => {
  const refreshToken = req.body.token; 

  try {
    if (!refreshToken) {
      return res.status(400).json({ msg: "Refresh token is required" });
    }

    await Token.deleteOne({ token: refreshToken });  // remove it from DB irespective of valid invalid fake token ,does not matter 
    return res.status(200).json({ msg: "Logout successful" });
  } catch (error) {
    console.log("Error while logging out:", error);
    return res.status(500).json({ msg: "Error while logging out "});
  }
};