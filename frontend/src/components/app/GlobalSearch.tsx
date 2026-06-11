import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Pill, Package, Truck, ShoppingCart, Bell, User } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getGlobalSearch } from "@/lib/services/search.service";

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: results, isLoading } = useQuery({
    queryKey: ["globalSearch", debouncedSearch],
    queryFn: () => getGlobalSearch(debouncedSearch),
    enabled: debouncedSearch.length > 0,
  });

  const handleSelect = (route: string, id: string) => {
    onOpenChange(false);
    // Use navigate with query params correctly depending on the router version
    navigate({ to: `/dashboard/${route}`, search: { highlight: id } as any });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput
        placeholder="Search medicines, batches, suppliers..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {debouncedSearch.length === 0 && (
          <CommandEmpty>Type a command or search...</CommandEmpty>
        )}
        {isLoading && debouncedSearch.length > 0 && (
          <CommandEmpty>Searching...</CommandEmpty>
        )}
        {!isLoading && debouncedSearch.length > 0 && (!results || Object.values(results).every((arr: any) => arr.length === 0)) && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {results?.medicines?.length > 0 && (
          <CommandGroup heading="Medicines">
            {results.medicines.map((item: any) => (
              <CommandItem key={item.id} value={`medicines-${item.id}`} onSelect={() => handleSelect("medicines", item.id)}>
                <Pill className="mr-2 h-4 w-4" />
                <span>{item.name} {item.genericName ? `(${item.genericName})` : ""}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.inventory?.length > 0 && (
          <CommandGroup heading="Inventory Batches">
            {results.inventory.map((item: any) => (
              <CommandItem key={item.id} value={`inventory-${item.id}`} onSelect={() => handleSelect("inventory", item.id)}>
                <Package className="mr-2 h-4 w-4" />
                <span>{item.medicine?.name} - Batch {item.batchNumber}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.suppliers?.length > 0 && (
          <CommandGroup heading="Suppliers">
            {results.suppliers.map((item: any) => (
              <CommandItem key={item.id} value={`suppliers-${item.id}`} onSelect={() => handleSelect("suppliers", item.id)}>
                <Truck className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.orders?.length > 0 && (
          <CommandGroup heading="Purchase Orders">
            {results.orders.map((item: any) => (
              <CommandItem key={item.id} value={`orders-${item.id}`} onSelect={() => handleSelect("orders", item.id)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                <span>Order from {item.supplier?.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.alerts?.length > 0 && (
          <CommandGroup heading="Alerts">
            {results.alerts.map((item: any) => (
              <CommandItem key={item.id} value={`alerts-${item.id}`} onSelect={() => handleSelect("alerts", item.id)}>
                <Bell className="mr-2 h-4 w-4" />
                <span>{item.message}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results?.users?.length > 0 && (
          <CommandGroup heading="Users">
            {results.users.map((item: any) => (
              <CommandItem key={item.id} value={`users-${item.id}`} onSelect={() => handleSelect("users", item.id)}>
                <User className="mr-2 h-4 w-4" />
                <span>{item.name} ({item.email})</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
