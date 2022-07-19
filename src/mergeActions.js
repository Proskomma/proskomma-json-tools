const mergeActions = (actionList) => {
    const ret = {};
    for (const action of actionList) {
        for (const key of Object.keys(action)) {
            if (ret[key]) {
                ret[key].push(... action[key]);
            } else {
                ret[key] = action[key];
            }
        }
    }
    return ret;
}

module.exports = mergeActions;
