"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Package, RefreshCw, Save } from "lucide-react"

type InventoryProduct = {
  id: number
  name: string
  stock: number
  price: number
}

export function InventoryManager() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [stockDrafts, setStockDrafts] = useState<Record<number, number>>({})
  const [savingId, setSavingId] = useState<number | null>(null)

  const {
    data: products = [],
    error,
    mutate,
    isLoading,
  } = useSWR<InventoryProduct[]>(
    "/api/products",
    (url) =>
      fetch(url, { headers: { "x-user-id": "1" } }).then((r) =>
        r.ok ? r.json() : Promise.reject(new Error("Failed to fetch products")),
      ),
  )

  const filteredProducts = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [products, searchTerm],
  )

  const handleUpdateStock = async (productId: number) => {
    const newStock = stockDrafts[productId]
    if (newStock == null || Number.isNaN(newStock)) return

    setSavingId(productId)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": "1" },
        body: JSON.stringify({ stock: newStock }),
      })
      if (!response.ok) throw new Error("Failed to update stock")
      toast({ title: "Stock updated", description: "Product stock has been updated." })
      setStockDrafts((prev) => {
        const next = { ...prev }
        delete next[productId]
        return next
      })
      await mutate()
    } catch {
      toast({ title: "Error", description: "Failed to update stock.", variant: "destructive" })
    } finally {
      setSavingId(null)
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      const response = await fetch(`/api/products/${productId}`, { method: "DELETE", headers: { "x-user-id": "1" } })
      if (!response.ok) throw new Error("Failed to delete product")
      toast({ title: "Product deleted", description: "The product has been removed." })
      await mutate()
    } catch {
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" })
    }
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Inventory Management
            </CardTitle>
            <CardDescription>Inline stock updates and low-inventory monitoring</CardDescription>
          </div>
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        {error && <div className="text-sm text-red-500">Unable to load inventory.</div>}
        {isLoading && <div className="text-sm text-muted-foreground">Loading inventory…</div>}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const draft = stockDrafts[product.id]
                const effectiveStock = draft ?? product.stock
                const dirty = draft != null && draft !== product.stock
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={effectiveStock}
                        onChange={(e) =>
                          setStockDrafts((prev) => ({ ...prev, [product.id]: Number.parseInt(e.target.value || "0", 10) }))
                        }
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      {effectiveStock > 10 ? (
                        <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                      ) : effectiveStock > 0 ? (
                        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStock(product.id)}
                        disabled={!dirty || savingId === product.id}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
