(function (app) {
    app.controller('HomeController', function ($scope, $q, InventoryService, $timeout, $window, $filter, $location, $anchorScroll)
    {
       
        var listener = $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                CloseLoadingDialog();
        });
        $scope.Initialize = function () {
            $scope.TotalSizes = [];
            $scope.ZonesOrder = 0;
            $scope.FloorsOrder = 20;
            $scope.UserProperties = null;
            $scope.Stores = null;
            $scope.SelectedStore = null;
            $scope.LoadedStore = null;
            $scope.loading = false;
            $scope.loaded = false;
            $scope.loadingMsg = '';
            $scope.FilterIsApplied = false;
            $scope.FilterFloors = [];
            $scope.ProductFilter = '';
            $scope.ZoneFilter = '';
            $scope.FilterCategories = [];
            $scope.FilterableProducts = [];
            
            //load all stores
            $scope.LoadStores();
           
        }
        $scope.ScrollTo = function(element) {
           $location.hash(element.toString());
           $anchorScroll();
        }



        $scope.LoadAll = function (msg) {
            $scope.filter = false;
            $scope.Products = [];
            $scope.Sizes = [];
            $scope.Floors = [];
            $scope.Zones = [];
            $scope.Inventory = [];
            $scope.Changes = 0;
            $scope.HasError = false;
            $scope.FilterableProducts = [];
            $q.all([DisplayLoadingDialog(msg), $scope.LoadFloors()]).then(function () {
                $scope.LoadZones().then(function () {
                    $scope.LoadSizes().then(function () {
                        $scope.LoadProducts().then(function () {
                            $scope.LoadInventory().then(function () {
                                //if ($scope.Inventory.length != 0)
                                CloseLoadingDialog();

                            });
                        });
                    });
                });                   
            });
        }
      

        $scope.LoadStores = function () {
            InventoryService.getUserProperties()
                .then(function (properties) {
                    //Store the profile properties for later.
                    $scope.UserProperties = properties;
                    //Read the userprofile properties of the current user.
                    InventoryService.getStores($scope.UserProperties.BranchCode).then(function (storeInfo) {
                        $scope.Stores = storeInfo;
                    });
                });
        }

        $scope.LoadFloors = function () {
          //  if ($scope.Floors.length != 0) return true;
            var d = $q.defer();
            InventoryService.getFloors().then(function (floors) {
                angular.forEach(floors, function (floor) {
                    $scope.Floors.push({                        
                        ID: floor.get_item('ID'),
                        Name: floor.get_item('Title'),
                        InitialOrder: floor.get_item('Order0'),
                        Order: floor.get_item('Order0'),
                        Exists: false,
                        IsCollapsed: false,
                    });
                });
                d.resolve();
            });
           
            return d.promise;
        }

        $scope.LoadZones = function () {
           // if ($scope.Zones.length != 0) return true;
            var d = $q.defer();           
            InventoryService.getZones().then(function (zones) {              
                angular.forEach(zones, function (zone) {
                    angular.forEach($scope.Floors, function (floor) {
                        $scope.Zones.push(
                            {
                                ID: zone.get_item('ID'),
                                Name: zone.get_item('Title'),
                                Exists: false,
                                IsCollapsed: false,
                                IsFilterApplied: false,
                                Floor: floor.Name,
                                Order: 0,
                                Products: true
                        });
                    });
                });            

                d.resolve();

            });
            
            return d.promise;
        }

        $scope.LoadProducts = function () {
           // if ($scope.Products.length != 0) return true;
            var d = $q.defer();

            InventoryService.getProducts().then(function (products) {               
                angular.forEach(products, function (product) {
                        for (var i = 0; i < product.get_item('Zones').length; i++) {
                            $scope.Products.push({
                                ID: product.get_item('ID'),
                                Title: product.get_item('Title'),
                                Cost: product.get_item('Cost'),
                                Supplier: product.get_item('Supplier'),
                                Category: product.get_item('Category'),
                                ShoeCount: product.get_item('Shoes'),
                                ArmCount: product.get_item('Arms'),
                                PairsCount: product.get_item('Pairs'),
                                Active: product.get_item('Active'),
                                Zone: product.get_item('Zones')[i].get_lookupValue(),
                                Floors: '',
                                Exists: false,
                            });
                        }
                });

                d.resolve();

            });
           
            return d.promise;
        }

        $scope.LoadSizes = function () {
           // if ($scope.Sizes.length != 0) return true;
            var d = $q.defer();

            InventoryService.getSizes().then(function (sizes) {
                angular.forEach(sizes, function (size) {
                    var productValue = (size.get_item('Product') == undefined) ? "" : size.get_item('Product').get_lookupValue();
                    var productId = (size.get_item('Product') == undefined) ? "" : size.get_item('Product').get_lookupId();
                    $scope.Sizes.push({
                        ID: size.get_item('ID'),
                        Size: size.get_item('Title'),
                        Product: productValue,
                        ProductId: productId,
                        Max: size.get_item('Max'),
                        Zones: '',
                    });
                });

                d.resolve();

            });

            return d.promise;
        }

        $scope.LoadInventory = function () {
            var d = $q.defer();
            InventoryService.getInventory($scope.SelectedStore.Branch).then(function (inventory) {
                angular.forEach(inventory, function (item) {
                    if (item.get_item('Product') != undefined && item.get_item('Size') != undefined) {
                        var floor = (item.get_item('Floor') == undefined) ? "" : item.get_item('Floor').get_lookupValue();
                        var zone = (item.get_item('Zone') == undefined) ? "" : item.get_item('Zone').get_lookupValue();
                        $scope.Inventory.push({
                            ID: item.get_item('ID'),
                            Branch: item.get_item('Branch'),
                            Area: item.get_item('Area'),
                            Region: item.get_item('Region'),
                            BranchName: item.get_item('BranchName'),
                            Product: item.get_item('Product').get_lookupValue(),
                            ProductId: item.get_item('Product').get_lookupId(),
                            Supplier: (item.get_item('Product_x003a_Supplier') == undefined) ? "" : item.get_item('Product_x003a_Supplier').get_lookupValue(),
                            Category: (item.get_item('Product_x003a_Category') == undefined) ? "" : item.get_item('Product_x003a_Category').get_lookupValue(),
                            Cost: (item.get_item('Product_x003a_Supplier') == undefined) ? 0 : item.get_item('Product_x003a_Cost').get_lookupValue(),
                            Size: item.get_item('Size').get_lookupValue(),
                            SizeId: item.get_item('Size').get_lookupId(),
                            Max: (item.get_item('Size_x003a_Max') == undefined) ? 0 : item.get_item('Size_x003a_Max').get_lookupValue(),
                            Floor: floor,
                            FloorId: (item.get_item('Floor') == undefined) ? 0 : item.get_item('Floor').get_lookupId(),
                            Zone:zone,
                            ZoneId: (item.get_item('Zone') == undefined) ? 0 : item.get_item('Zone').get_lookupId(),
                            Qty: item.get_item('Qty'),
                            IsDirty: false,
                            IsDeleted: false,
                            IsHidden: false,
                            IsError: false

                        });
                        SetExistingFloor(floor);
                        SetExistingZone(floor, zone);
                    }                  
            });
                $scope.TotalSizes.length = 0;
                SetInitialTotalSizes();
                $scope.LoadedStore = $scope.SelectedStore;
                d.resolve();
            });
           
            return d.promise;
        }    

        $scope.AddFloor = function (newFloor) {
            if (newFloor != "undefined" && newFloor != null)
            {
                newFloor.Exists = true;
                newFloor.Order = $scope.FloorsOrder + 1;
                $scope.FloorsOrder++;
            }
                
        }

        $scope.AddZone = function (newZone) {
            if (newZone != "undefined" && newZone != null)
            {
                newZone.Exists = true;
                newZone.Order = $scope.ZonesOrder + 1;
                $scope.ZonesOrder++;
            }               
        }

        $scope.AddProduct = function (floor, zone, product)
        {          
            $scope.Inventory.push({
                ID: 0,
                Region: $scope.SelectedStore.Region,
                Area: $scope.SelectedStore.Area,
                Branch: $scope.SelectedStore.Branch,
                BranchName: $scope.SelectedStore.BranchName,
                Product: "Please select..",
                ProductId: 0,
                Size: "Please select..",
                SizeId: 0,
                Floor: floor.Name,
                FloorId: floor.ID,
                Zone: zone.Name,
                ZoneId: zone.ID,
                Qty: 1,
                Supplier: '',
                Category: '',
                Cost:0,
                Max: 0,
                IsDirty: false,
                IsDeleted: false,
                IsHidden: false,
                IsError: false
            });

        }

        $scope.OnItemChanged = function (oldProduct, changedProduct, product) {
            if (!changedProduct.IsDirty)
            {
                changedProduct.IsDirty = true;
                $scope.Changes++;
            }
            changedProduct.Product = product.Title;
            changedProduct.ProductId = product.ID;
            changedProduct.Supplier = product.Supplier;
            changedProduct.Category = product.Category;
            changedProduct.Cost = product.Cost;
            changedProduct.ShoeCount = product.ShoeCount;
            changedProduct.ArmCount = product.ArmCount;
            changedProduct.PairsCount = product.PairsCount;

        }

        $scope.OnQtyChanged = function (oldQty, changedProduct)
        {
            //only numbers are allowed in qty field
            if (parseInt(changedProduct.Qty) == "undefined")
            {
                changedProduct.Qty = oldQty;
                alert('Please enter a valid number.');
                return true;
            }
            
            changedProduct.Qty = changedProduct.Qty == null ? 0 : parseInt(changedProduct.Qty);
            if (!changedProduct.IsDirty)
            {
                changedProduct.IsDirty = true;
                $scope.Changes++;
            }
            //update total qty of product
            SetTotalQty(changedProduct, parseInt(oldQty));            
        }

        $scope.RemoveProduct = function (removedProduct, zone)
        {
            //Ensure that the user wishes to delete the product.
            bootbox.confirm('Are you sure you want to remove <b>"'+removedProduct.Product+'"</b> from <b>"'+ zone+'"</b> ?', function (result) {
                if (result) {
                    $scope.$apply(function () {

                        var removedQty = parseInt(removedProduct.Qty);
                        //update number of changes
                        if (removedProduct.ID != 0 && !removedProduct.IsDirty)
                            $scope.Changes++;
                        else if (removedProduct.ID == 0 && removedProduct.IsDirty)
                            $scope.Changes--;

                        removedProduct.IsDeleted = true;
                        removedProduct.Qty = 0;
                        removedProduct.IsDirty = true;

                        //re-add size to list of selectable sizes for that product
                        angular.forEach($scope.Sizes, function (size) {
                            if (size.Size == removedProduct.Size && size.Product == removedProduct.Product) {
                                if (size.Zones.indexOf(removedProduct.Floor + '-' + zone) > -1) size.Zones = size.Zones.replace(removedProduct.Floor + '-' + zone + ";", "");
                            }

                        });

                        //re-add product to list of selectable products if it does not exist
                        angular.forEach($scope.Products, function (item) {
                            if (item.Zone == zone && item.Title == removedProduct.Product)
                                if (item.Floors.indexOf(removedProduct.Floor) > -1) item.Floors = item.Floors.replace(removedProduct.Floor + ";", "");
                                //item.Exists = false;
                        });
                        //update total qty of product
                        SetTotalQty(removedProduct, removedQty);
                    });
                }
            });
        }

        $scope.SubmitInventory = function ()
        {
            if ($scope.Changes == 0) return false;
            
            var newItems = [];
            var changedItems = [];
            var deletedItems = [];
            DisplayLoadingDialog('Saving Inventory');
            angular.forEach($scope.Inventory, function (product) {
                if (product.ID == 0 && product.SizeId != 0 && !product.IsDeleted)
                    newItems.push(product);
                else if (product.IsDirty && !product.IsDeleted && product.SizeId != 0)
                    changedItems.push(product);
                else if (product.IsDirty && product.IsDeleted && product.ID != 0 && product.SizeId != 0)
                    deletedItems.push(product);
            });
            $q.all([InventoryService.UpdateInventory(changedItems), InventoryService.CreateInventoryItems(newItems)]).then(function () {
                InventoryService.DeleteInventory(deletedItems).then(function () {
                    //map newly added items to their ids
                    GetSavedInventory();
                    CloseLoadingDialog();
                });
            });           
        }

        $scope.OnSizeChanged = function (changedProduct, sizes, newSize, oldSize, zone, floor)
        {
            if (!changedProduct.IsDirty) {
                changedProduct.IsDirty = true;
                $scope.Changes++;
            }
            var disabledSizes = 0;
            angular.forEach(sizes, function (size) {
                if (size.Size == newSize && changedProduct.Product == size.Product)
                {
                    changedProduct.SizeId = size.ID;
                    changedProduct.Size = size.Size;
                    changedProduct.Max = size.Max;
                    if (size.Zones.indexOf(changedProduct.Floor+ '-' + zone) === -1) size.Zones += changedProduct.Floor+ '-' + zone + ';';
                }

                if (size.Size == oldSize && changedProduct.Product == size.Product)
                {
                    if (size.Zones.indexOf(changedProduct.Floor+ '-' + zone) > -1) size.Zones = size.Zones.replace(changedProduct.Floor+ '-' + zone + ";", "");                                         
                }

            });
            //disable product if all sizes were used
            angular.forEach($scope.Inventory, function (item) {
                
                if (item.Product == changedProduct.Product && item.Zone == zone)
                    disabledSizes++;
            });
            if(sizes.length == disabledSizes)
            {
                angular.forEach($scope.Products, function (item) {
                    if (item.Zone == zone && item.Title == changedProduct.Product)
                        item.Exists = true;
                });
            }
            SetTotalQty(changedProduct, 0);
        }

        $scope.UpdateOptions = function (zone, product, sizeCount, size, sizes)
        {           
            if (sizeCount == 1)
            {
                if (size.ID != 0 && product.SizeId == 0)
                {
                    product.SizeId = size.ID;
                    product.Size = size.Size;
                    product.Max = size.Max;
                    SetTotalQty(product);
                }
                angular.forEach($scope.Products, function (item) {
                    if (item.Zone == zone && item.Title == product.Product )
                        //item.Exists = true;
                        if (item.Floors.indexOf(product.Floor) === -1) item.Floors += product.Floor + ';';
                });
            }
            if(product.Size == size.Size || sizeCount == 1)
                size.Zones += product.Floor + '-' + zone + ';';
        }   

        $scope.IsError = function (product)
        {
            $scope.HasError = false;
            angular.forEach($scope.TotalSizes, function (totalSize) {
                if (totalSize.Key.indexOf(product.Product + product.Size) > -1)
                    product.IsError = totalSize.IsError;
                if (totalSize.IsError) $scope.HasError = true;
            });
            return true;
        }

        $scope.ExpandAll = function ()
        {
            angular.forEach($scope.Zones, function (zone) {
                if (zone.Exists)
                {
                    zone.IsCollapsed = false;
                    zone.IsFilterApplied = false;
                }
                    
            });

            angular.forEach($scope.Floors, function (floor) {
                if(floor.Exists)
                    floor.IsCollapsed = false;
            });
        }

        $scope.CollapseAll = function ()
        {
            angular.forEach($scope.Zones, function (zone) {
                if (zone.Exists)
                {
                    zone.IsCollapsed = true;
                    zone.IsFilterApplied = false;
                }

            });

            angular.forEach($scope.Floors, function (floor) {
                if(floor.Exists)
                    floor.IsCollapsed = true;
            });
        }

        $scope.SetCollapsedZone = function (zone, length) {
            if (length == 0 && !zone.IsCollapsed)
                zone.IsCollapsed = false;
            else {
                zone.IsCollapsed = !zone.IsCollapsed;
            }
            zone.IsFilterApplied = false;
        }

        $scope.FilterProducts = function ()
        {
            var FloorsToShow = [];
            if ($scope.ProductFilter == undefined) $scope.ProductFilter = "";
            if ($scope.ProductFilter.Product != undefined) $scope.ProductFilter = $scope.ProductFilter.Product;
            if ($scope.ZoneFilter == undefined) $scope.ZoneFilter = "";
            if ($scope.ZoneFilter.Zone != undefined) $scope.ZoneFilter = $scope.ZoneFilter.Zone;
            if ($scope.ProductFilter != "" || $scope.FilterFloors.length > 0 || $scope.ZoneFilter != "" || $scope.FilterCategories.length > 0)
            {
                angular.forEach($scope.Inventory, function (product) {
                    
                        if ((product.Product != null && (product.Product.toUpperCase().indexOf($scope.ProductFilter.toUpperCase()) > -1 || $scope.ProductFilter == ""))
                        && ($scope.FilterFloors.indexOf(product.Floor) > -1 || $scope.FilterFloors.length == 0)
                        && (product.Zone.toUpperCase().indexOf($scope.ZoneFilter.toUpperCase()) > -1 || $scope.ZoneFilter == "")
                        && ($scope.FilterCategories.indexOf(product.Category) > -1 || $scope.FilterCategories.length == 0)) {
                            product.IsHidden = false;
                            FloorsToShow.push(product.Floor, product.Zone);
                        }
                        else { product.IsHidden = true; }
                                                            
                });
                angular.forEach($scope.Zones, function (zone) {
                    if (zone.Exists)
                        zone.IsFilterApplied = true;
                });
                angular.forEach($scope.Floors, function (floor) {
                    if (FloorsToShow.indexOf(floor.Name) === -1)
                        floor.IsCollapsed = true;
                    else floor.IsCollapsed = false;
                });
            }
            else
            {
                // show all products, zones and floors
                $scope.ClearFilter();
            }
                     
        }

        $scope.UpdateFilter = function (filterValues, currentFilter)
        {
            var idx = filterValues.indexOf(currentFilter);
            if(idx > -1)
            {
                filterValues.splice(idx, 1);
            }
            else {
                filterValues.push(currentFilter);
            }
        }           

        $scope.ClearFilter = function ()
        {
            $scope.ProductFilter = null;
            $scope.FilterFloors = [];
            $scope.ZoneFilter = null;
            $scope.FilterCategories = [];
            // show all products
            angular.forEach($scope.Inventory, function (product) {
                product.IsHidden = false;
            });
            // show all zones and floors
            $scope.ExpandAll();
            
        }

        $scope.RefreshInventory = function () {
            
            $scope.LoadAll("Loading Saved Inventory");           
        }

        $scope.GetFloorOrder = function (item) {
            angular.forEach($scope.Floors, function (floor) {
                if (floor == item.Floor)
                    return floor.InitialOrder;
            });
        }

        function DisplayLoadingDialog(msg) {
            $scope.loaded = false;
            $scope.loading = true;
            $scope.loadingMsg = msg;
        }

        function CloseLoadingDialog() {
            $scope.loading = false;
            $scope.loadingMsg = '';
            $scope.loaded = true;
        }

        function SetTotalQty(product, oldQty)
        {
            var exists = false;
            oldQty = isNaN(oldQty) ? 0 : oldQty;
            newQty =  isNaN(parseInt(product.Qty)) ? 0 : parseInt(product.Qty);
            angular.forEach($scope.TotalSizes, function (totalSize) {
                if (totalSize.Key.indexOf(product.Product + product.Size) > -1) {
                    exists = true;
                    totalSize.TotalQty -= oldQty;
                    totalSize.TotalQty += newQty;
                    if (totalSize.TotalQty > totalSize.Max && totalSize.Max != 0)
                        totalSize.IsError = true;
                    else totalSize.IsError = false;
                }
            });
            if (!exists && product.Product != null && product.Size != null)
            {
                $scope.TotalSizes.push({
                    Key: product.Product + product.Size,
                    Product: product.Product,
                    Size: product.Size,
                    Max: product.Max,
                    TotalQty: newQty
                });
            }
               
        }      

        function GetSavedInventory()
        {
            $scope.Changes = 0;
            InventoryService.getInventory($scope.SelectedStore.Branch).then(function (inventory) {
               
                angular.forEach($scope.Inventory, function (oldItem) {
                    if (oldItem.ID == 0)
                    {
                        for(i=0;i<inventory.length;i++)
                        {
                            if (inventory[i].get_item('Size') != undefined && inventory[i].get_item('Product') != undefined) {
                                var product = inventory[i].get_item('Product').get_lookupValue();
                                var size = inventory[i].get_item('Size').get_lookupValue();
                                var floor = inventory[i].get_item('Floor').get_lookupValue();
                                var zone = inventory[i].get_item('Zone').get_lookupValue();
                                if (product == oldItem.Product
                                        && zone == oldItem.Zone
                                        && floor == oldItem.Floor
                                        && size == oldItem.Size
                                    )


                                    oldItem.ID = inventory[i].get_item('ID');
                            }
                        }
                    }
                    oldItem.IsDirty = false;
                });

            });
            // override the automatic ordering of the zones
            $scope.ZonesOrder = 0;
            angular.forEach($scope.Zones, function (zone) {
                zone.Order = 0;
            });

            //override the automatic ordering of the floors
            $scope.FloorsOrder = 0;
            angular.forEach($scope.Floors, function (floor) {
                floor.Order = floor.InitialOrder;
            });
        }

        function SetExistingFloor(currentFloor) {
            //floor contains inventory items
            angular.forEach($scope.Floors, function (floor) {
                if (currentFloor == floor.Name) {
                    floor.Exists = true;
                }
            });
        }

        function SetExistingZone(currentFloor, currentZone) {
           //zone of floor contains inventory items
            angular.forEach($scope.Zones, function (zone) {
                if (currentFloor == zone.Floor && currentZone == zone.Name) {
                    zone.Exists = true;
                }
            });
        }

        function SetInitialTotalSizes() {
            
            angular.forEach($scope.Inventory, function (item) {
                var total = 0;
                var exists = false;

                angular.forEach($scope.TotalSizes, function (totalSize) {
                    if (totalSize.Key.indexOf(item.Product + item.Size) > -1)
                        exists = true;
                })

                if (!exists && item.Product != null && item.Size != null) {

                    angular.forEach($scope.Inventory, function (item1) {
                        if (item1.Product == item.Product && item.Size == item1.Size)
                            total += item1.Qty;
                    });
                    $scope.TotalSizes.push({
                        Key: item.Product + item.Size,
                        Product: item.Product,
                        Size: item.Size,
                        Max: item.Max,
                        TotalQty: total,
                        IsError: total > item.Max
                    });
                }

            });
        }

        
    });
    app.filter('unique', function () {
        return function (collection, keyname) {
            var output = [],
                keys = [];

            angular.forEach(collection, function (item) {
                var key = item[keyname];
                if (keys.indexOf(key) === -1) {
                    keys.push(key);
                    output.push(item);
                }
            });

            return output;
        };
        
    });

    app.directive('onfinishrender', function ($timeout) {
        var rendered = false;
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                scope.$watch('loading', function (value) {
                    if (value) {
                        rendered = false
                    }
                });

                if (scope.$last === true && !rendered) {
                    rendered = true;
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    }, 0);
                }
            }
        }
    });
}(angular.module('Inventory')));
