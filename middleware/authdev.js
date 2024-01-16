const jwt = require('jsonwebtoken');
const { response } = require('../utils/utils');
const { PrismaClient } = require('@prisma/client');

const checkToken = {
    makeAuthDev: function (req, res) {
        const name = 'D3v_3-KPB'
        var encodedToken = jwt.sign({ username: name }, process.env.API_KEY)
        console.log({
            'AccessToken': 'Becarefully For Token',
            'access-token': encodedToken,
            'username': name
        });
        return res.json({
            message: 'Berhasil Buat'
        })
    },
    checkAuthDev: function (req, res, next) {
        const token = req.headers['access-token'];
        // console.log(token);
        if (token) {
            try {
                var decoded = jwt.verify(token, process.env.API_KEY);
                if (decoded.username === req.headers.username) {
                    // return next()
                    return res.json({
                        message: 'Auth Successfully'
                    })
                } else {
                    return res.json(response.errorAuth(401))
                }
            } catch (err) {
                return res.json(response.errorAuth(401))
            }
        } else {
            return res.json(response.errorAuth(401))
        }
    },
    requireAuthDev: function (req, res, next) {
        const token = req.headers['access-token'];
        // console.log(token);
        if (token) {
            try {
                var decoded = jwt.verify(token, process.env.API_KEY);
                if (decoded.username === req.headers.username) {
                    return next()
                    // return res.json({
                    //   message: 'berhasil sob'
                    // })
                } else {
                    return res.json(response.errorAuth(401))
                }
            } catch (err) {
                return res.json(response.errorAuth(401))
            }
        } else {
            return res.json(response.errorAuth(401))
        }
    }
}

module.exports = checkToken;