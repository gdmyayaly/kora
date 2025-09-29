import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { VentesDataService } from '../../../services/ventes-data.service';
import { Customer, Article, SalesInvoice, SalesInvoiceItem } from '../../../interfaces/ventes.interface';

interface InvoiceFormData {
  customer: Customer | null;
  issueDate: string;
  dueDate: string;
  description: string;
  items: InvoiceItem[];
  discountAmount: number;
  notes: string;
}

interface InvoiceItem {
  id: string;
  article: Article;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  taxRate: number;
}

@Component({
  selector: 'app-nouvelle-facture',
  imports: [CommonModule, FormsModule],
  templateUrl: './nouvelle-facture.html',
  styleUrl: './nouvelle-facture.css'
})
export class NouvelleFacture implements OnInit {
  private toastService = inject(ToastService);
  private ventesDataService = inject(VentesDataService);
  private router = inject(Router);

  protected readonly currentStep = signal(1);
  protected readonly totalSteps = 3;
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);

  protected readonly customers = signal<Customer[]>([]);
  protected readonly articles = signal<Article[]>([]);
  protected readonly filteredCustomers = signal<Customer[]>([]);
  protected readonly filteredArticles = signal<Article[]>([]);

  protected readonly customerSearch = signal('');
  protected readonly articleSearch = signal('');
  protected readonly showCustomerDropdown = signal(false);
  protected readonly showArticleDropdown = signal(false);

  protected readonly formData = signal<InvoiceFormData>({
    customer: null,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: this.getDefaultDueDate(),
    description: '',
    items: [],
    discountAmount: 0,
    notes: ''
  });

  protected readonly calculations = computed(() => {
    const items = this.formData().items;
    const discountAmount = this.formData().discountAmount;

    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscount = itemTotal * (item.discountRate / 100);
      return sum + (itemTotal - itemDiscount);
    }, 0);

    const taxAmount = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemDiscount = itemTotal * (item.discountRate / 100);
      const taxableAmount = itemTotal - itemDiscount;
      return sum + (taxableAmount * (item.taxRate / 100));
    }, 0);

    const totalAmount = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount
    };
  });

  protected readonly isStepValid = computed(() => {
    const step = this.currentStep();
    const data = this.formData();

    switch (step) {
      case 1:
        return data.customer !== null;
      case 2:
        return data.items.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  });

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [customers, articles] = await Promise.all([
        this.ventesDataService.getCustomers(),
        this.ventesDataService.getArticles()
      ]);

      this.customers.set(customers.filter(c => c.status === 'active'));
      this.articles.set(articles.filter(a => a.isActive));
      this.filteredCustomers.set(this.customers());
      this.filteredArticles.set(this.articles());
    } catch (error) {
      this.toastService.error('Erreur lors du chargement des données');
    } finally {
      this.isLoading.set(false);
    }
  }

  private getDefaultDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  }

  protected onCustomerSearchChange(value: string): void {
    this.customerSearch.set(value);
    const filtered = this.customers().filter(customer =>
      customer.name.toLowerCase().includes(value.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(value.toLowerCase())
    );
    this.filteredCustomers.set(filtered);
    this.showCustomerDropdown.set(value.length > 0);
  }

  protected onSelectCustomer(customer: Customer): void {
    this.formData.update(data => ({ ...data, customer }));
    this.customerSearch.set(customer.name);
    this.showCustomerDropdown.set(false);
  }

  protected onArticleSearchChange(value: string): void {
    this.articleSearch.set(value);
    const filtered = this.articles().filter(article =>
      article.name.toLowerCase().includes(value.toLowerCase()) ||
      article.sku.toLowerCase().includes(value.toLowerCase())
    );
    this.filteredArticles.set(filtered);
    this.showArticleDropdown.set(value.length > 0);
  }

  protected onAddArticle(article: Article): void {
    const existingItem = this.formData().items.find(item => item.article.id === article.id);

    if (existingItem) {
      this.onUpdateItemQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: InvoiceItem = {
        id: this.generateId(),
        article,
        quantity: 1,
        unitPrice: article.unitPrice,
        discountRate: 0,
        taxRate: article.taxRate
      };

      this.formData.update(data => ({
        ...data,
        items: [...data.items, newItem]
      }));
    }

    this.articleSearch.set('');
    this.showArticleDropdown.set(false);
    this.toastService.success(`${article.name} ajouté à la facture`);
  }

  protected onRemoveItem(itemId: string): void {
    this.formData.update(data => ({
      ...data,
      items: data.items.filter(item => item.id !== itemId)
    }));
  }

  protected onUpdateItemQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.onRemoveItem(itemId);
      return;
    }

    this.formData.update(data => ({
      ...data,
      items: data.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    }));
  }

  protected onUpdateItemPrice(itemId: string, unitPrice: number): void {
    this.formData.update(data => ({
      ...data,
      items: data.items.map(item =>
        item.id === itemId ? { ...item, unitPrice } : item
      )
    }));
  }

  protected onUpdateItemDiscount(itemId: string, discountRate: number): void {
    this.formData.update(data => ({
      ...data,
      items: data.items.map(item =>
        item.id === itemId ? { ...item, discountRate } : item
      )
    }));
  }

  protected onNextStep(): void {
    if (this.currentStep() < this.totalSteps && this.isStepValid()) {
      this.currentStep.update(step => step + 1);
    }
  }

  protected onPreviousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }

  protected onGoToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep.set(step);
    }
  }

  protected async onSaveAsDraft(): Promise<void> {
    await this.saveInvoice('draft');
  }

  protected async onCreateAndSend(): Promise<void> {
    await this.saveInvoice('sent');
  }

  private async saveInvoice(status: 'draft' | 'sent'): Promise<void> {
    if (!this.formData().customer || this.formData().items.length === 0) {
      this.toastService.error('Veuillez compléter les informations obligatoires');
      return;
    }

    this.isSaving.set(true);

    try {
      const data = this.formData();
      const calc = this.calculations();

      const invoiceItems: SalesInvoiceItem[] = data.items.map(item => ({
        id: item.id,
        articleId: item.article.id,
        articleName: item.article.name,
        description: item.article.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountRate: item.discountRate,
        discountAmount: (item.quantity * item.unitPrice) * (item.discountRate / 100),
        taxRate: item.taxRate,
        taxAmount: ((item.quantity * item.unitPrice) - ((item.quantity * item.unitPrice) * (item.discountRate / 100))) * (item.taxRate / 100),
        totalPrice: item.quantity * item.unitPrice,
        unit: item.article.unit
      }));

      const invoice: Omit<SalesInvoice, 'id' | 'invoiceNumber' | 'createdAt'> = {
        customerId: data.customer!.id,
        customerName: data.customer!.name,
        customerEmail: data.customer!.email,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        amount: calc.subtotal,
        taxAmount: calc.taxAmount,
        discountAmount: calc.discountAmount,
        totalAmount: calc.totalAmount,
        paidAmount: 0,
        remainingAmount: calc.totalAmount,
        status,
        currency: 'XOF',
        paymentStatus: 'pending',
        description: data.description || 'Facture de vente',
        items: invoiceItems,
        payments: [],
        notes: data.notes
      };

      const createdInvoice = await this.ventesDataService.createSalesInvoice(invoice);

      const message = status === 'draft'
        ? `Facture ${createdInvoice.invoiceNumber} sauvegardée en brouillon`
        : `Facture ${createdInvoice.invoiceNumber} créée et envoyée`;

      this.toastService.success(message);
      this.router.navigate(['/ventes/factures-vente']);

    } catch (error) {
      this.toastService.error('Erreur lors de la création de la facture');
    } finally {
      this.isSaving.set(false);
    }
  }

  protected onCancel(): void {
    this.router.navigate(['/ventes/factures-vente']);
  }

  protected onIssueDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, issueDate: target.value }));
  }

  protected onDueDateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, dueDate: target.value }));
  }

  protected onDescriptionChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, description: target.value }));
  }

  protected onDiscountAmountChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.formData.update(data => ({ ...data, discountAmount: +target.value }));
  }

  protected onNotesChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.formData.update(data => ({ ...data, notes: target.value }));
  }

  protected formatCurrency(amount: number): string {
    return this.ventesDataService.formatCurrency(amount);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}