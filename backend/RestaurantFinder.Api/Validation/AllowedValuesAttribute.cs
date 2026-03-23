using System.ComponentModel.DataAnnotations;

namespace RestaurantFinder.Api.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Parameter)]
public sealed class AllowedValuesAttribute : ValidationAttribute
{
    private readonly HashSet<string> _allowedValues;

    public AllowedValuesAttribute(params string[] allowedValues)
    {
        _allowedValues = new HashSet<string>(allowedValues, StringComparer.OrdinalIgnoreCase);
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is null)
            return ValidationResult.Success;

        if (value is string text && _allowedValues.Contains(text))
            return ValidationResult.Success;

        var options = string.Join(", ", _allowedValues.OrderBy(x => x));
        return new ValidationResult($"The field {validationContext.MemberName} must be one of: {options}.");
    }
}
