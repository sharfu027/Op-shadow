using Microsoft.AspNetCore.Mvc;

namespace INK.ERP.API.Models;

public record PaginationParameters
{
    [FromQuery(Name = "page")]
    public int Page { int get => _page; init => _page = value < 1 ? 1 : value; }
    private readonly int _page = 1;

    [FromQuery(Name = "pageSize")]
    public int PageSize { int get => _pageSize; init => _pageSize = value > 100 ? 100 : (value < 1 ? 10 : value); }
    private readonly int _pageSize = 10;
}

public record SecurityFilterParameters : PaginationParameters
{
    [FromQuery(Name = "status")]
    public string? Status { get; init; }

    [FromQuery(Name = "severity")]
    public string? Severity { get; init; }

    [FromQuery(Name = "startDate")]
    public DateTime? StartDate { get; init; }

    [FromQuery(Name = "endDate")]
    public DateTime? EndDate { get; init; }

    [FromQuery(Name = "search")]
    public string? Search { get; init; }

    [FromQuery(Name = "sort")]
    public string? Sort { get; init; }
}

public sealed record PaginationMetadata(
    int TotalCount,
    int PageSize,
    int CurrentPage,
    int TotalPages);
