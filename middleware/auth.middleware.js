const jwt = require('jsonwebtoken');
const config = require('config');
module.exports = (req, res, next) => {
    if(req.method === 'OPTIONS'){
        // OPTIONS - спеціяльний метод, який присутній в REST API, який провіряє доступність сервера 
        return next()
    }

    try {
        
        const token = req.headers.authorization.split(' ')[1]

        if( !token ){
            res.status(401).json({message: 'Не авторизовано'})
        }

        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded;

        next()

    } catch (error) {
        res.status(401).json({message: 'Не авторизовано'})
    }
}