const {Router} = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator')
const router = Router();

// /api/auth/register
router.post(
    '/register',
    [
        check("email", "Некоректний email").isEmail(),
        check("password", "Мінімальна довжина пароля 6 символів")
            .isLength({min: 6})
    ],
    async (req, res) => {
    
        try {
            
            const error = validationResult(req);
            if(!error.isEmpty()){
                return res.status(400).json({
                    error: error.array(),
                    message: 'Некоректні дані при реєстрації'
                })
            }
            
            const {email, password} = req.body;

            const candidate = await User.findOne({email});

            if(candidate) {
                return res.status(400).json({ message: "Користувач існує"})
            }
            
            const hashPassword = await bcrypt.hash(password, 12);
            const user = new User({ email, password: hashPassword});
            console.log('user: ', user);
            
            await user.save();
           

            res.status(201).json({message: "Користувач створений!!!"})



        } catch (error) {
            res.status(500).json({message: "Щось пішло не так, спробуйте пізніше"})
        }
});

// /api/auth/login
router.post(
    '/login',
    [
        check('email', 'Некоректний email').normalizeEmail().isEmail(),
        check('password', 'Ведіть пароль').exists()
            .isLength({min: 6})
    ],
    async (req, res) => {
    try {
        const error = validationResult(req);
        if(!error.isEmpty()){
            return res.status(400).json({
                error: error.array(),
                message: 'Некоректні дані при вході'
            })
        }

        const {email, password} = req.body;

        const user = await User.findOne({email})

        if(!user) {
            res.status(400).json({message: "користувач не знайдений"})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if(!isMatch) {
            return res.status(400).json({message: "Невірний пароль, спробуйте знову"})
        }
        
        const token = jwt.sign(
            { userId: user.id },  
            config.get('jwtSecret'), // ключ
            { expiresIn: '1h'} // час на який створюється токен

        )
        res.json({ token, userId: user.id});
       

    } catch (error) {
        res.status(500).json({message: "Щось пішло не так, спробуйте пізніше"})
    }
    

});




module.exports = router;