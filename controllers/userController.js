const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports.register = async (req, res) => {
    try {
        const {fullName, email, password} = req.body;
        let errors = [];

        const nameRegExp = "[A-Z][a-z]+\\s+[A-Z][a-z]+";
        const mailRegExp = "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)])";
        const passRegExp = ["^(.*?[A-Z]){2,}.*$", "^(.*?\\d){2,}.*$"];

        if (!fullName || !email || !password) {
            return res.status(403).json({
                message: "Fill in all fields"
            });
        }

        if (!fullName.match(nameRegExp)) {
            errors.push("Full name is invalid. It must be of format `Name Surname`");
        }
        if (!email.match(mailRegExp)) {
            errors.push("Enter correct email");
        }
        if (!(password.length > 8) || !password.match(passRegExp[0]) ||
            !password.match(passRegExp[1]) || password.includes(" ")) {
            errors.push("Invalid password. Password must contain 2 uppercase letters, 3 numbers, not contain space and be longer than 8 symbols");
        }

        if (errors.length > 0) {
            let str = "";
            errors.forEach(el => {
                str = str.concat(el + '\n');
            });
            return res.status(400).json({
                message: str
            });
        }

        const foundUser = await User.findOne({email: email}).exec();
        if (foundUser) {
            return res.status(400).json({
                message: "This email has already occupied."
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });
        const user = await newUser.save();
        return res.status(200).json({
            message: `${user.fullName}, you are successfully registered.`
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "error"
        });
    }
};

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email: email}).exec();

        if (user) {
            const isSamePassword = await bcrypt.compare(password, user.password);
            if (isSamePassword) {
                const token = jwt.sign({
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email
                }, process.env.ACCESS_TOKEN, {
                    expiresIn: '1m'
                });
                return res.status(200).json({
                    message: `${user.fullName}, you are successfully logged in.`,
                    token: `Bearer ${token}`
                })
            }
            return res.status(401).json({
                message: "The password is incorrect."
            });
        }
        return res.status(404).json({
            message: "User with this email is not found."
        });
    } catch (err) {
        console.log( err);
        return res.status(500).json({
            message: 'Error'
        })
    }
};