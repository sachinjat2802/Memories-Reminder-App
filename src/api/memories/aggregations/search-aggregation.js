const Memory = require("../memory-model");

const search = async (searchString) => {
    try {
        const regex = new RegExp(searchString, 'i');
        const data = await Memory.aggregate([
            {
                $match: {
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
                                $elemMatch: {
                                    $regex: regex,
                                }
                            }
                        },
                        {
                            description: {
                                $elemMatch: {
                                    $regex: regex,
                                }
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
