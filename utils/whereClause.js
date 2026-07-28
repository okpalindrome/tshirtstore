// base = Product.find()
// base - Product.find(email: {"one@dev.com"})

// bigQ = search=coder&page=2&category=shortsleeves&rating[gte]=4&price[lte]=999&price[gte]=199

class WhereClause {
    constructor(base, bigQ) {
        this.base = base
        this.bigQ = bigQ
    }

    search() {
        const searchWord = this.bigQ.search ? {
            name: {
                $regex: this.bigQ.search,
                $options: 'i' // i - case insensitve or g - global 
            }
        } : {};

        this.base = this.base.find({...searchWord})
        return this;
    }

    pager(resultPerPage) {
        let currentPage = 1
        if (this.bigQ.page) {
            currentPage = this.bigQ.page
        }

        // well known formula for pagination
        const skipVal = resultPerPage * (currentPage - 1)

        this.base = this.base.limit(resultPerPage).skip(skipVal)
        return this;
    }

    filter() {
        const copyBigQ = {...this.bigQ}

        delete copyBigQ['search'];
        delete copyBigQ['page'];
        delete copyBigQ['limit'];

        // convert copyBigQ into a string
        let stringOfCopyBigQ = JSON.stringify(copyBigQ)

        stringOfCopyBigQ = stringOfCopyBigQ.replace(/\b(gte|lte|gt|lt)\b/g, m => `$${m}`)

        const jsonOfCopyBigQ = JSON.parse(stringOfCopyBigQ)
        
        this.base = this.base.find(jsonOfCopyBigQ)
        return this
    }
}

module.exports = WhereClause;