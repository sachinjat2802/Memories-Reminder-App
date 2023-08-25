const Memory = require("../memory-model");

const search = async (email, searchString) => {
    try {
        const regex = new RegExp(searchString, 'i');
        const data = await Memory.aggregate([
            {
                $match: {
                    belongs_to: email,
                    $or: [
                        {
                            tags: {
                                $elemMatch: {
                                    $regex: regex,
                                }
                            }
                        },
                        {
                            tittle: {
                                $regex: regex,
                            }
                        },
                        {
                            description: {
                                $regex: regex,
                            }
                        }
                    ]
                },
            },
        ]);
        return data;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

module.exports = search;
