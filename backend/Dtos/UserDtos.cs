namespace Etteremkereso.Dtos;

public record UserCreateDto(
    string Username,
    string Email,
    string PasswordHash
);

public record UserUpdateDto(
    string Username,
    string Email,
    string PasswordHash
);
