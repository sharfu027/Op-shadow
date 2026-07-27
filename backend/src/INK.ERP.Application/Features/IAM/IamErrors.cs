using INK.ERP.Domain.Common;

namespace INK.ERP.Application.Features.IAM;

public static class IamErrors
{
    public static class User
    {
        public static Error NotFound(Guid id) => new("User.NotFound", $"User with ID '{id}' was not found.", ErrorType.NotFound);
        public static Error UsernameAlreadyExists(string username) => new("User.UsernameExists", $"Username '{username}' is already taken.", ErrorType.Conflict);
        public static Error EmailAlreadyExists(string email) => new("User.EmailExists", $"Email '{email}' is already registered.", ErrorType.Conflict);
        public static readonly Error CannotDeactivateLastAdmin = new("User.LastAdmin", "Cannot deactivate the last administrator.", ErrorType.Failure);
        public static readonly Error CannotLockSelf = new("User.CannotLockSelf", "You cannot lock your own account.", ErrorType.Failure);
        public static readonly Error InactiveCannotReceiveRoles = new("User.Inactive", "Cannot assign roles to an inactive user.", ErrorType.Failure);
        public static readonly Error PasswordPolicyViolation = new("User.PasswordPolicy", "Password does not meet the required policy.", ErrorType.Validation);
        public static readonly Error CurrentPasswordIncorrect = new("User.CurrentPasswordIncorrect", "The current password is incorrect.", ErrorType.Validation);
    }

    public static class Role
    {
        public static Error NotFound(Guid id) => new("Role.NotFound", $"Role with ID '{id}' was not found.", ErrorType.NotFound);
        public static Error CodeAlreadyExists(string code) => new("Role.CodeExists", $"Role code '{code}' already exists.", ErrorType.Conflict);
        public static readonly Error CannotDeleteSystemRole = new("Role.SystemRole", "Cannot delete a system role.", ErrorType.Failure);
        public static readonly Error CannotRemoveLastAdminRole = new("Role.LastAdmin", "Cannot remove the last administrator role assignment.", ErrorType.Failure);
        public static Error DuplicateAssignment(string roleName) => new("Role.Duplicate", $"User already has role '{roleName}'.", ErrorType.Conflict);
    }

    public static class Permission
    {
        public static Error NotFound(Guid id) => new("Permission.NotFound", $"Permission with ID '{id}' was not found.", ErrorType.NotFound);
        public static Error CodeAlreadyExists(string code) => new("Permission.CodeExists", $"Permission code '{code}' already exists.", ErrorType.Conflict);
        public static Error GroupNotFound(Guid id) => new("Permission.GroupNotFound", $"Permission group with ID '{id}' was not found.", ErrorType.NotFound);
    }
}
