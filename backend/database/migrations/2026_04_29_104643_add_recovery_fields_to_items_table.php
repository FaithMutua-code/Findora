<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->enum('status',['active','returned'])->default('active');
            $table->enum('recovery_method',[
                    'system_match',
                    'direct_contact',
                    'admin_assisted'
            ])->nullable();
            $table->text('recovery_notes')->nullable();
            $table->timestamp('recovered_at')->nullable();
            $table->unsignedBigInteger('recovered_by')->nullable();
            $table->foreign('recovered_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn(['status','recovery_method','recovery_notes','recovered_at','recovered_by']);
        });
    }
};
