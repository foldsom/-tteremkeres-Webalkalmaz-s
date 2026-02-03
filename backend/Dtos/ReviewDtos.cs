namespace Etteremkereso.Dtos;

public record ReviewCreateDto(
    int Rating,
    string Comment,
    int UserId,
    int RestaurantId
);

public record ReviewUpdateDto(
    int Rating,
    string Comment
);
