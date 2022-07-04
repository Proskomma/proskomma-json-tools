class ProskommaRenderAction {

    constructor(ob) {
        if (!ob) {
            throw new Error("Must provide a constructor object to constructor");
        }
        this.description = ob.description || throw new Error("Must provide a description in constructor object");
        this.test = ob.test || (() => true);
        this.action = ob.action || (() => null);
    }
}

module.exports = ProskommaRenderAction;
