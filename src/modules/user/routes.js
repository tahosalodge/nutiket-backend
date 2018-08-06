const router = require('express').Router();
const { catchErrors } = require('utils/errorHandlers');
const Controller = require('./controller');

const { tokenMiddleware } = Controller;
const controller = new Controller();

router.post('/login', catchErrors(controller.login));

router.post('/register', catchErrors(controller.register));

router.post('/me', catchErrors(controller.me));

router.post('/forgot', catchErrors(controller.resetPassword));

router.get('/users', tokenMiddleware, catchErrors(controller.getUsers));
