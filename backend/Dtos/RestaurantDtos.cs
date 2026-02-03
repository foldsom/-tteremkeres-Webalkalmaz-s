namespace Etteremkereso.Dtos;

public record RestaurantCreateDto(
    string Name,
    string Description,
    string Address,
    double Latitude,
    double Longitude
);

public record RestaurantUpdateDto(
    string Name,
    string Description,
    string Address,
    double Latitude,
    double Longitude
);
