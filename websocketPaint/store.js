function Store() {
    this.users = [];
    this.paintData = []
};

Store.prototype.clearStore = function () {
    this.paintData = [];
};

Store.prototype.startLine = function (payload) {
    this.paintData.push(payload);
};

Store.prototype.addPath = function (payload) {
    const { x, y } = payload;
    this.paintData[this.paintData.length - 1].path.push(x, y);
};

Store.prototype.addUser = function (user) {
    this.users.push(user);
};

module.exports = Store;