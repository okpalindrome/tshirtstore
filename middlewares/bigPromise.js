//to avoid using try catch and async - await or promise everywhere

module.exports = func => (req, res, next) => 
    Promise.resolve(func(req, res, next)).catch(next)