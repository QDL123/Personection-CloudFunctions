module.exports = async (refArray) => {
    return Promise.all(
        refArray.map(ref => {
            return ref.get();
        })
    );
}