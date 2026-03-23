using System.Net;
using System.Net.Http.Json;

namespace RestaurantFinder.Api.Tests;

public class RestaurantsEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public RestaurantsEndpointTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetRestaurants_InvalidSortBy_ReturnsBadRequest()
    {
        var response = await _client.GetAsync("/api/restaurants?sortBy=unknown");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetRestaurants_FavoritesOnlyWithoutAuth_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/restaurants?favoritesOnly=true");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetRestaurants_ReturnsPagedPayload()
    {
        var payload = await _client.GetFromJsonAsync<PagedResult>("/api/restaurants?page=1&pageSize=5");

        Assert.NotNull(payload);
        Assert.Equal(1, payload!.Page);
        Assert.Equal(5, payload.PageSize);
        Assert.True(payload.TotalCount >= payload.Items.Count);
        Assert.True(payload.Items.Count <= 5);
    }

    private sealed record PagedResult(int Page, int PageSize, int TotalCount, List<RestaurantRow> Items);

    private sealed record RestaurantRow(int Id, string Name);
}
