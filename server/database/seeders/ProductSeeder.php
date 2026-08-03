<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categoriesData = [
            'Necklaces',
            'Headpieces',
            'Chains',
            'Accessories',
        ];

        $categories = [];
        foreach ($categoriesData as $catName) {
            $categories[$catName] = Category::firstOrCreate([
                'slug' => Str::slug($catName)
            ], [
                'name' => $catName
            ]);
        }

        $products = [
            [
                'name' => 'Rose Quartz Spike Necklace',
                'description' => 'Handwoven Byzantine chainmail collar with a translucent rose quartz focal and three dangling silver spikes. Edgy, gothic, and one of a kind.',
                'price' => 148.00,
                'stock' => 8,
                'material' => 'Stainless steel, rose quartz',
                'finish' => 'Polished silver-tone',
                'dimensions' => 'Choker fit, adjustable clasp',
                'size_options' => [
                    ['label' => 'Choker 13"', 'stock' => 3],
                    ['label' => 'Choker 14"', 'stock' => 3],
                    ['label' => 'Choker 15"', 'stock' => 2],
                ],
                'category_id' => $categories['Necklaces']->id,
                'is_featured' => true,
                'images' => [
                    ['image_url' => 'images/products/rose-quartz-spike-necklace.png', 'is_primary' => true],
                ],
            ],
            [
                'name' => 'Garnet Chainmail Bib',
                'description' => 'Antique silver-tone chainmaille bib necklace with deep garnet drops and a clustered center charm. Dark romanticism in every link.',
                'price' => 132.00,
                'stock' => 6,
                'material' => 'Stainless steel, garnet glass',
                'finish' => 'Oxidized silver',
                'dimensions' => 'Bib length ~18cm',
                'size_options' => [
                    ['label' => '16"', 'stock' => 2],
                    ['label' => '18"', 'stock' => 3],
                    ['label' => '20"', 'stock' => 1],
                ],
                'category_id' => $categories['Necklaces']->id,
                'is_featured' => true,
                'discount_type' => 'percentage',
                'discount_value' => 10,
                'images' => [
                    ['image_url' => 'images/products/garnet-chainmail-necklace.png', 'is_primary' => true],
                ],
            ],
            [
                'name' => 'Crystal Web Headpiece',
                'description' => 'Delicate lattice of faceted crystal beads and fine silver chain. Drapes the crown with four spiked strands for an ethereal dark-fantasy look.',
                'price' => 168.00,
                'stock' => 5,
                'material' => 'Crystal glass, silver-tone wire',
                'finish' => 'Bright silver',
                'dimensions' => 'One size, adjustable pins',
                'size_options' => null,
                'category_id' => $categories['Headpieces']->id,
                'is_featured' => true,
                'images' => [
                    ['image_url' => 'images/products/crystal-web-headpiece.png', 'is_primary' => true],
                ],
            ],
            [
                'name' => 'Barbed Wallet Chain',
                'description' => 'Dense Byzantine weave wallet chain punctuated with four-pointed barbed spikes. Clips to a belt loop with a polished lobster clasp.',
                'price' => 98.00,
                'stock' => 12,
                'material' => 'Stainless steel',
                'finish' => 'Polished silver-tone',
                'dimensions' => 'Approx. 50cm / 60cm / 70cm',
                'size_options' => [
                    ['label' => '50cm', 'stock' => 4],
                    ['label' => '60cm', 'stock' => 5],
                    ['label' => '70cm', 'stock' => 3],
                ],
                'category_id' => $categories['Chains']->id,
                'is_featured' => true,
                'images' => [
                    ['image_url' => 'images/products/barbed-wallet-chain.png', 'is_primary' => true],
                ],
            ],
            [
                'name' => 'Chainmail Lighter Sleeve',
                'description' => 'Tightly woven stainless chainmail sleeve for a standard lighter, hung from a curb-link chain with a carabiner clip. Industrial and handmade.',
                'price' => 64.00,
                'stock' => 15,
                'material' => 'Stainless steel',
                'finish' => 'Polished silver-tone',
                'dimensions' => 'Fits standard disposable lighter',
                'size_options' => null,
                'category_id' => $categories['Accessories']->id,
                'is_featured' => false,
                'discount_type' => 'fixed',
                'discount_value' => 10,
                'images' => [
                    ['image_url' => 'images/products/chainmail-lighter-case.png', 'is_primary' => true],
                ],
            ],
            [
                'name' => 'Spike Drop Choker',
                'description' => 'Minimal silver-tone choker with a single central spike drop. Clean lines for everyday dark aesthetic.',
                'price' => 72.00,
                'stock' => 10,
                'material' => 'Stainless steel',
                'finish' => 'Polished silver-tone',
                'dimensions' => 'Adjustable 12–15"',
                'size_options' => [
                    ['label' => '12–13"', 'stock' => 4],
                    ['label' => '14–15"', 'stock' => 6],
                ],
                'category_id' => $categories['Necklaces']->id,
                'is_featured' => false,
                'images' => [
                    ['image_url' => 'images/products/rose-quartz-spike-necklace.png', 'is_primary' => true],
                ],
            ],
            [
                'name' => 'Icy Lattice Crown',
                'description' => 'Smaller crystal mesh crown with short spiked fringe. Soft blue-silver shimmer against dark hair or fabric.',
                'price' => 154.00,
                'stock' => 4,
                'material' => 'Crystal glass, silver-tone wire',
                'finish' => 'Bright silver',
                'dimensions' => 'One size',
                'size_options' => null,
                'category_id' => $categories['Headpieces']->id,
                'is_featured' => false,
                'images' => [
                    ['image_url' => 'images/products/crystal-web-headpiece.png', 'is_primary' => true],
                ],
            ],
            [
                'name' => 'Curb Link Statement Chain',
                'description' => 'Heavy polished curb-link chain for layering or wearing alone. Solid clasp, cool industrial weight.',
                'price' => 88.00,
                'stock' => 14,
                'material' => 'Stainless steel',
                'finish' => 'High polish',
                'dimensions' => 'Choose length',
                'size_options' => [
                    ['label' => '45cm', 'stock' => 5],
                    ['label' => '55cm', 'stock' => 5],
                    ['label' => '65cm', 'stock' => 4],
                ],
                'category_id' => $categories['Chains']->id,
                'is_featured' => false,
                'images' => [
                    ['image_url' => 'images/products/barbed-wallet-chain.png', 'is_primary' => true],
                ],
            ],
        ];

        foreach ($products as $data) {
            $images = $data['images'];
            unset($data['images']);

            $product = Product::firstOrCreate(
                ['name' => $data['name']],
                $data
            );

            if ($product->wasRecentlyCreated) {
                if (!empty($product->discount_type) && !empty($product->discount_value)) {
                    $product->applySaleDiscount();
                    $product->save();
                }

                foreach ($images as $index => $imageData) {
                    $product->images()->create([
                        'image_url' => $imageData['image_url'],
                        'is_primary' => $imageData['is_primary'] ?? ($index === 0),
                        'sort_order' => $index,
                    ]);
                }
            }
        }
    }
}
