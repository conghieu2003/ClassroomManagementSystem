class Account {
    constructor(accountId, password, role, isActive = true) {
        this.accountId = accountId;
        this.password = password;
        this.role = role;
        this.isActive = isActive;
    }
}

module.exports = Account;
