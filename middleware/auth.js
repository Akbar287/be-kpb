const jwt = require('jsonwebtoken');
const { response } = require('../utils/utils');
const { PrismaClient } = require('@prisma/client')

const checkToken = {
    requireAuth: function (req, res, next) {
        const token = req.headers['access-token'];
        if (token) {
            try {
                var decoded = jwt.verify(token, process.env.API_KEY);
                if (decoded.nik === req.headers.username) {
                    return next()
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