# Tài liệu tham khảo CI/CD & Optimization

Tài liệu này tổng hợp các công nghệ và kỹ thuật đã sử dụng để tối ưu hóa pipeline CI/CD cho dự án Micro-Frontend Monorepo.

## 1. Change Detection (Phát hiện thay đổi thông minh)

Chúng ta sử dụng `dorny/paths-filter` để phát hiện xem những file nào đã thay đổi trong commit/PR. Điều này giúp tránh việc build lại toàn bộ hệ thống khi chỉ thay đổi một module nhỏ.

- **Docs:** [dorny/paths-filter GitHub](https://github.com/dorny/paths-filter)
- **Áp dụng:** Job `detect-changes` trong `.github/workflows/ci-cd.yml`.
- **Logic:**
  - `packages/**` -> `packages_changed`
  - `apps/shell/**` -> `shell_changed`
  - `package.json`, `pnpm-lock.yaml`, .etc -> `root_config_changed`

## 2. Turborepo Smart Caching & Affected

Turborepo là công cụ build system chính, giúp tối ưu hóa task runner.

- **Docs:** [Turborepo Documentation](https://turbo.build/repo/docs)
- **Tính năng dùng:**
  - **Filter (`--filter`):** Chỉ chạy task cho package cụ thể.
  - **Affected (`--affected`):** Chỉ chạy task cho các package bị ảnh hưởng bởi thay đổi git.
  - **Remote Caching:** Cache kết quả build lên cloud (hoặc local artifact) để tái sử dụng nếu code không đổi.

## 3. GitHub Actions Optimization

Sử dụng các tính năng nâng cao của GitHub Actions để điều khiển luồng chạy.

- **Docs:** [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- **Kỹ thuật:**
  - **`needs`**: Định nghĩa dependency giữa các jobs.
  - **`outputs`**: Truyền dữ liệu (biến `changed`) từ job này sang job khác.
  - **`if` Conditionals**:

    ```yaml
    # Ví dụ: Chỉ chạy lint nếu có code thay đổi
    if: needs.detect-changes.outputs.any_changed == 'true'

    # Ví dụ: Chạy build nếu lint thành công HOẶC lint bị skip (do không có code đổi)
    if: always() && (needs.lint.result == 'success' || needs.lint.result == 'skipped')
    ```

## 4. Package Manager Caching (pnpm)

Tối ưu hóa thời gian cài đặt dependencies.

- **Docs:** [Caching dependencies to speed up workflows](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- **Áp dụng:**
  - Sử dụng `actions/cache@v4` để cache thư mục `pnpm store`.
  - Khóa version bằng `packageManager` trong `package.json`.

## 5. Chiến lược "Full Rebuild" vs "Smart Rebuild"

Logic hiện tại trong CI file:

1. **Config gốc thay đổi** (`package.json`, `tsconfig.json`...):
   - Set `needs_full_rebuild = true`.
   - Build TẤT CẢ apps.
   - Run lint TẤT CẢ.

2. **Apps cụ thể thay đổi** (`apps/app-react/**`):
   - Set `app_react_changed = true`.
   - Chỉ build `app-react`.
   - Turborepo tự động detect dependencies liên quan.

3. **Chỉ docs thay đổi** (`*.md`):
   - Không chạy job build nào.
   - Job `lint-and-typecheck` sẽ bị skip nếu dùng flag `any_changed`.
