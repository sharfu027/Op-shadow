using MediatR;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Application.Features.MasterData.Products.DTOs;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Entities.MasterData;

namespace INK.ERP.Application.Features.MasterData.Products.Commands;

public record CreateProductCommand(
    Guid CompanyId,
    Guid CategoryId,
    Guid BrandId,
    Guid BaseUomId,
    string Code,
    string Name,
    string Sku,
    string? Barcode,
    string HsnCode,
    decimal GstRatePercent,
    decimal Mrp,
    decimal BasePrice,
    decimal MinOrderQty,
    int? ShelfLifeDays,
    bool IsBatchTracked) : IRequest<Result<ProductDto>>;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IBrandRepository _brandRepository;
    private readonly IUnitOfMeasureRepository _uomRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateProductCommandHandler(
        IProductRepository productRepository,
        ICompanyRepository companyRepository,
        ICategoryRepository categoryRepository,
        IBrandRepository brandRepository,
        IUnitOfMeasureRepository uomRepository,
        IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _companyRepository = companyRepository;
        _categoryRepository = categoryRepository;
        _brandRepository = brandRepository;
        _uomRepository = uomRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductDto>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company == null)
        {
            return Result<ProductDto>.Failure(Error.NotFound("Company.NotFound", $"Parent Company with ID '{request.CompanyId}' was not found."));
        }

        if (!await _productRepository.IsCodeUniqueAsync(request.CompanyId, request.Code, null, cancellationToken))
        {
            return Result<ProductDto>.Failure(Error.Conflict("Product.DuplicateCode", $"Product code '{request.Code}' already exists under company '{company.LegalName}'."));
        }

        if (!await _productRepository.IsSkuUniqueAsync(request.CompanyId, request.Sku, null, cancellationToken))
        {
            return Result<ProductDto>.Failure(Error.Conflict("Product.DuplicateSku", $"Product SKU '{request.Sku}' already exists under company '{company.LegalName}'."));
        }

        var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
        var brand = await _brandRepository.GetByIdAsync(request.BrandId, cancellationToken);
        var uom = await _uomRepository.GetByIdAsync(request.BaseUomId, cancellationToken);

        var product = new Product
        {
            CompanyId = request.CompanyId,
            CategoryId = request.CategoryId,
            BrandId = request.BrandId,
            BaseUomId = request.BaseUomId,
            Code = request.Code.ToUpperInvariant().Trim(),
            Name = request.Name.Trim(),
            Sku = request.Sku.ToUpperInvariant().Trim(),
            Barcode = request.Barcode?.Trim(),
            HsnCode = request.HsnCode.Trim(),
            GstRatePercent = request.GstRatePercent,
            Mrp = request.Mrp,
            BasePrice = request.BasePrice,
            MinOrderQty = request.MinOrderQty <= 0 ? 1.0m : request.MinOrderQty,
            ShelfLifeDays = request.ShelfLifeDays,
            IsBatchTracked = request.IsBatchTracked,
            IsActive = true
        };

        await _productRepository.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ProductDto(
            product.Id,
            product.CompanyId,
            company.LegalName,
            product.CategoryId,
            category?.Name,
            product.BrandId,
            brand?.Name,
            product.BaseUomId,
            uom?.Code,
            product.Code,
            product.Name,
            product.Sku,
            product.Barcode,
            product.HsnCode,
            product.GstRatePercent,
            product.Mrp,
            product.BasePrice,
            product.MinOrderQty,
            product.ShelfLifeDays,
            product.IsBatchTracked,
            product.IsActive,
            product.CreatedAtUtc);

        return Result<ProductDto>.Success(dto);
    }
}

public record UpdateProductCommand(
    Guid Id,
    Guid CompanyId,
    Guid CategoryId,
    Guid BrandId,
    Guid BaseUomId,
    string Code,
    string Name,
    string Sku,
    string? Barcode,
    string HsnCode,
    decimal GstRatePercent,
    decimal Mrp,
    decimal BasePrice,
    decimal MinOrderQty,
    int? ShelfLifeDays,
    bool IsBatchTracked,
    bool IsActive) : IRequest<Result<ProductDto>>;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Result<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IBrandRepository _brandRepository;
    private readonly IUnitOfMeasureRepository _uomRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProductCommandHandler(
        IProductRepository productRepository,
        ICompanyRepository companyRepository,
        ICategoryRepository categoryRepository,
        IBrandRepository brandRepository,
        IUnitOfMeasureRepository uomRepository,
        IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _companyRepository = companyRepository;
        _categoryRepository = categoryRepository;
        _brandRepository = brandRepository;
        _uomRepository = uomRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductDto>> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product == null)
        {
            return Result<ProductDto>.Failure(Error.NotFound("Product.NotFound", $"Product with ID '{request.Id}' was not found."));
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company == null)
        {
            return Result<ProductDto>.Failure(Error.NotFound("Company.NotFound", $"Parent Company with ID '{request.CompanyId}' was not found."));
        }

        if (!await _productRepository.IsCodeUniqueAsync(request.CompanyId, request.Code, request.Id, cancellationToken))
        {
            return Result<ProductDto>.Failure(Error.Conflict("Product.DuplicateCode", $"Product code '{request.Code}' already exists under company '{company.LegalName}'."));
        }

        if (!await _productRepository.IsSkuUniqueAsync(request.CompanyId, request.Sku, request.Id, cancellationToken))
        {
            return Result<ProductDto>.Failure(Error.Conflict("Product.DuplicateSku", $"Product SKU '{request.Sku}' already exists under company '{company.LegalName}'."));
        }

        var category = await _categoryRepository.GetByIdAsync(request.CategoryId, cancellationToken);
        var brand = await _brandRepository.GetByIdAsync(request.BrandId, cancellationToken);
        var uom = await _uomRepository.GetByIdAsync(request.BaseUomId, cancellationToken);

        product.CompanyId = request.CompanyId;
        product.CategoryId = request.CategoryId;
        product.BrandId = request.BrandId;
        product.BaseUomId = request.BaseUomId;
        product.Code = request.Code.ToUpperInvariant().Trim();
        product.Name = request.Name.Trim();
        product.Sku = request.Sku.ToUpperInvariant().Trim();
        product.Barcode = request.Barcode?.Trim();
        product.HsnCode = request.HsnCode.Trim();
        product.GstRatePercent = request.GstRatePercent;
        product.Mrp = request.Mrp;
        product.BasePrice = request.BasePrice;
        product.MinOrderQty = request.MinOrderQty <= 0 ? 1.0m : request.MinOrderQty;
        product.ShelfLifeDays = request.ShelfLifeDays;
        product.IsBatchTracked = request.IsBatchTracked;
        product.IsActive = request.IsActive;

        await _productRepository.UpdateAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ProductDto(
            product.Id,
            product.CompanyId,
            company.LegalName,
            product.CategoryId,
            category?.Name,
            product.BrandId,
            brand?.Name,
            product.BaseUomId,
            uom?.Code,
            product.Code,
            product.Name,
            product.Sku,
            product.Barcode,
            product.HsnCode,
            product.GstRatePercent,
            product.Mrp,
            product.BasePrice,
            product.MinOrderQty,
            product.ShelfLifeDays,
            product.IsBatchTracked,
            product.IsActive,
            product.CreatedAtUtc);

        return Result<ProductDto>.Success(dto);
    }
}

public record DeleteProductCommand(Guid Id) : IRequest<Result<Unit>>;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Result<Unit>>
{
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductCommandHandler(IProductRepository productRepository, IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product == null)
        {
            return Result<Unit>.Failure(Error.NotFound("Product.NotFound", $"Product with ID '{request.Id}' was not found."));
        }

        await _productRepository.DeleteAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
