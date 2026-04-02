@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8 text-center">
            <div class="error-page mt-5">
                <h1 class="display-1 text-danger">403</h1>
                <h2 class="mb-4">Access Denied</h2>
                <p class="lead mb-4">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                
                <div class="d-flex justify-content-center gap-3">
                    <a href="javascript:history.back()" class="btn btn-primary">
                        <i class="fas fa-arrow-left me-2"></i>ย้อนกลับ
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.error-page {
    padding: 40px 0;
}

.error-page h1 {
    font-size: 80px;
    font-weight: 700;
    margin-bottom: 20px;
}

.error-page h2 {
    font-size: 24px;
    font-weight: 600;
    color: #333;
}

.error-page .lead {
    font-size: 18px;
    color: #666;
}

.error-page .btn {
    padding: 10px 20px;
    font-size: 16px;
}
</style>
@endsection