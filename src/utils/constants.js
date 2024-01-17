"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingStatus = exports.AppontmentStatus = exports.TransactionStatus = exports.Roles = void 0;
var Roles;
(function (Roles) {
    Roles[Roles["USER"] = 0] = "USER";
    Roles[Roles["ADMIN"] = 1] = "ADMIN";
})(Roles || (exports.Roles = Roles = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus[TransactionStatus["PENDING"] = 0] = "PENDING";
    TransactionStatus[TransactionStatus["COMPLETED"] = 1] = "COMPLETED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var AppontmentStatus;
(function (AppontmentStatus) {
    AppontmentStatus[AppontmentStatus["PENDING"] = 0] = "PENDING";
    AppontmentStatus[AppontmentStatus["COMPLETED"] = 1] = "COMPLETED";
})(AppontmentStatus || (exports.AppontmentStatus = AppontmentStatus = {}));
var ListingStatus;
(function (ListingStatus) {
    ListingStatus[ListingStatus["PENDING"] = 0] = "PENDING";
    ListingStatus[ListingStatus["ACTIVE"] = 1] = "ACTIVE";
    ListingStatus[ListingStatus["SOLD"] = 2] = "SOLD";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
