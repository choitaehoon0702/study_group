"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudiesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const studies_service_1 = require("./studies.service");
const create_study_dto_1 = require("./dto/create-study.dto");
let StudiesController = class StudiesController {
    studiesService;
    constructor(studiesService) {
        this.studiesService = studiesService;
    }
    create(user, dto) {
        return this.studiesService.create(user.id, dto);
    }
    findAll() {
        return this.studiesService.findAll();
    }
    findOne(studyId) {
        return this.studiesService.findOne(studyId);
    }
    leaveStudy(studyId, user) {
        return this.studiesService.leaveStudy(studyId, user.id);
    }
    removeMember(studyId, targetUserId, user) {
        return this.studiesService.removeMember(studyId, targetUserId, user.id);
    }
};
exports.StudiesController = StudiesController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_study_dto_1.CreateStudyDto]),
    __metadata("design:returntype", void 0)
], StudiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StudiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':studyId'),
    __param(0, (0, common_1.Param)('studyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], StudiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':studyId/leave'),
    __param(0, (0, common_1.Param)('studyId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], StudiesController.prototype, "leaveStudy", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':studyId/members/:userId'),
    __param(0, (0, common_1.Param)('studyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", void 0)
], StudiesController.prototype, "removeMember", null);
exports.StudiesController = StudiesController = __decorate([
    (0, common_1.Controller)('studies'),
    __metadata("design:paramtypes", [studies_service_1.StudiesService])
], StudiesController);
//# sourceMappingURL=studies.controller.js.map