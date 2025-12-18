import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  userName = '';
  successMessage = '';
  showProfileMenu = false;

  selectedRowId: string | null = null;
  editingExpenseId: string | null = null;

  expenses: any[] = [];
  filteredExpenses: any[] = [];

  categories = [
    'Food',
    'Travel',
    'Groceries',
    'Shopping',
    'Entertainment',
    'Recharge',
    'EMI',
    'Other',
  ];

  selectedDate = '';
  selectedCategory = '';

  todayTotal = 0;
  monthTotal = 0;
  overallTotal = 0;

  selectedCategoryName: string | null = null;
  selectedCategoryAmount = 0;

  isDarkMode = false;
  showAddForm = false;

  newExpense = {
    title: '',
    amount: null as number | null,
    category: '',
    date: new Date().toISOString().slice(0, 10),
  };

  highestCategory = '—';
  lowestCategory = '—';

  categoryStats: { name: string; amount: number; percent: number }[] = [];

  pieData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [{ data: [] }],
  };

  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_: any, elements: any[]) => {
      if (!elements.length) return;
      const index = elements[0].index;
      this.selectedCategoryName = this.pieData.labels?.[index] as string;
      this.selectedCategoryAmount = this.pieData.datasets[0].data[index] as number;
    },
  };

  backendUrl = 'http://localhost:4000/api/expenses';

  constructor(private http: HttpClient, private router: Router, private auth: Auth) {}

  ngOnInit() {
    const user = this.auth.getUser();
    this.userName = user?.name || 'User';
    this.loadExpenses();
  }

  getAuthHeaders() {
    return { Authorization: `Bearer ${this.auth.getToken()}` };
  }

  selectRow(expense: any) {
    this.selectedRowId = expense._id;
  }

  loadExpenses() {
    this.http.get<any[]>(this.backendUrl, { headers: this.getAuthHeaders() }).subscribe((data) => {
      this.expenses = data;
      this.filteredExpenses = [...data];
      this.prepareChart(this.filteredExpenses);
      this.calculateKPIs(this.filteredExpenses);
      this.calculateCategoryInsights(this.filteredExpenses);
    });
  }

  saveExpense() {
    if (
      !this.newExpense.title ||
      !this.newExpense.amount ||
      !this.newExpense.category ||
      !this.newExpense.date
    )
      return;

    const payload = {
      ...this.newExpense,
      amount: Number(this.newExpense.amount),
      userId: this.auth.getUser()?._id,
    };

    if (this.editingExpenseId) {
      this.http
        .put(`${this.backendUrl}/${this.editingExpenseId}`, payload, {
          headers: this.getAuthHeaders(),
        })
        .subscribe(() => {
          this.successMessage = 'Expense updated successfully ✅';
          this.resetForm();
          this.loadExpenses();
        });
    } else {
      this.http.post(this.backendUrl, payload, { headers: this.getAuthHeaders() }).subscribe(() => {
        this.successMessage = 'Expense added successfully ✅';
        this.resetForm();
        this.loadExpenses();
      });
    }
  }

  resetForm() {
    this.showAddForm = false;
    this.editingExpenseId = null;

    this.newExpense = {
      title: '',
      amount: null,
      category: '',
      date: new Date().toISOString().slice(0, 10),
    };

    setTimeout(() => (this.successMessage = ''), 3000);
  }
  editExpense(expense: any) {
    const confirmEdit = confirm('Are you sure you want to edit this expense?');
    if (!confirmEdit) return;

    this.showAddForm = true;
    this.editingExpenseId = expense._id;

    this.newExpense = {
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date.slice(0, 10),
    };

    // 🔥 AUTO SCROLL TO FORM
    setTimeout(() => {
      document.querySelector('.add-expense-card')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }

  deleteExpense(id: string) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    this.http
      .delete(`${this.backendUrl}/${id}`, { headers: this.getAuthHeaders() })
      .subscribe(() => this.loadExpenses());
  }

  applyFilters() {
    this.filteredExpenses = this.expenses.filter((e) => {
      const d = new Date(e.date).toISOString().slice(0, 10);
      return (
        (!this.selectedDate || d === this.selectedDate) &&
        (!this.selectedCategory || e.category === this.selectedCategory)
      );
    });
    this.prepareChart(this.filteredExpenses);
    this.calculateKPIs(this.filteredExpenses);
    this.calculateCategoryInsights(this.filteredExpenses);
  }

  resetFilters() {
    this.selectedDate = '';
    this.selectedCategory = '';
    this.filteredExpenses = [...this.expenses];
    this.prepareChart(this.filteredExpenses);
    this.calculateKPIs(this.filteredExpenses);
    this.calculateCategoryInsights(this.filteredExpenses);
  }

  calculateKPIs(data: any[]) {
    const today = new Date().toISOString().slice(0, 10);
    const m = new Date().getMonth();
    const y = new Date().getFullYear();

    this.todayTotal = this.monthTotal = this.overallTotal = 0;

    data.forEach((e) => {
      const d = new Date(e.date);
      this.overallTotal += e.amount;
      if (d.toISOString().slice(0, 10) === today) this.todayTotal += e.amount;
      if (d.getMonth() === m && d.getFullYear() === y) this.monthTotal += e.amount;
    });
  }

  calculateCategoryInsights(data: any[]) {
    const map: Record<string, number> = {};
    data.forEach((e) => (map[e.category] = (map[e.category] || 0) + e.amount));

    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return;

    this.highestCategory = sorted[0][0];
    this.lowestCategory = sorted[sorted.length - 1][0];

    const max = sorted[0][1];
    this.categoryStats = sorted.map(([name, amount]) => ({
      name,
      amount,
      percent: Math.round((amount / max) * 100),
    }));
  }

  prepareChart(data: any[]) {
    const map: Record<string, number> = {};
    data.forEach((e) => (map[e.category] = (map[e.category] || 0) + e.amount));
    this.pieData = {
      labels: Object.keys(map),
      datasets: [{ data: Object.values(map) }],
    };
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
