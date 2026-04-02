<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Branch;
use Illuminate\Support\Facades\DB;

class FixBranchNearbyData extends Command
{
    protected $signature = 'branch:fix-nearby';
    protected $description = 'Fix branches nearby data to ensure they are valid JSON arrays';

    public function handle()
    {
        $branches = Branch::all();
        $this->info('Fixing nearby data for ' . count($branches) . ' branches...');
        
        foreach ($branches as $branch) {
            $this->line('Processing branch: ' . $branch->name);
            
            // Fix nearby_shoppingmall
            $this->fixNearbyField($branch, 'nearby_shoppingmall');
            
            // Fix nearby_attractions
            $this->fixNearbyField($branch, 'nearby_attractions');
            
            // Fix nearby_industrialestates
            $this->fixNearbyField($branch, 'nearby_industrialestates');
            
            // Fix nearby_governmentinstitutions
            $this->fixNearbyField($branch, 'nearby_governmentinstitutions');
            
            $branch->save();
        }
        
        $this->info('All branches nearby data fixed successfully!');
        return 0;
    }
    
    protected function fixNearbyField($branch, $field)
    {
        $value = $branch->getRawOriginal($field);
        
        if (is_null($value) || $value === '' || $value === '""' || $value === 'null') {
            // If null or empty, set as empty array
            $this->line("  - {$field}: Empty value fixed");
            DB::table('branches')->where('id', $branch->id)->update([$field => '[]']);
        } else {
            // Try to decode and re-encode to ensure it's valid JSON
            $decoded = json_decode($value, true);
            if (!is_array($decoded)) {
                $this->warn("  - {$field}: Invalid JSON fixed");
                DB::table('branches')->where('id', $branch->id)->update([$field => '[]']);
            } else {
                // Filter empty values and reset array keys
                $filtered = array_values(array_filter($decoded));
                if (count($filtered) !== count($decoded)) {
                    $this->line("  - {$field}: Filtered empty values");
                    DB::table('branches')->where('id', $branch->id)->update([$field => json_encode($filtered)]);
                }
            }
        }
    }
}