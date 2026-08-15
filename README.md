# Egg Route

Create a responsive, mobile-first Web Application for internal sales and delivery management (POS and Logistics). 



Theme & Aesthetic:

- Modern Dark Mode.

- Main background: Deep Navy Blue (#0A192F or similar).

- Text and primary elements: Clean White and Slate Gray for secondary text.

- Accent colors: Elegant Gold (#D4AF37) for primary buttons, highlights, and totals; Dull Blue for badges and secondary actions.

- Layout should look professional, clean, and highly scannable with high contrast.



Core App Structure (Two Main Tabs):



1. TAB "NOVO PEDIDO" (Fast Order Entry Screen):

- This is a high-speed Point of Sale (POS) interface for internal use.

- Customer Selection: A searchable dropdown/autocomplete field to select a customer. Display the customer's name and their assigned neighborhood/route.

- Product Grid/List: Optimized specifically for selling egg cartons ("cartelas") and variations. Each product card must display:

  * Product Name (e.g., "Cartela Ovos Brancos Grande - 30 un", "Cartela Ovos Vermelhos - 30 un", "Cartela Ovos Caipira - 20 un", "Dúzia de Ovos").

  * Price per unit/cartela.

  * Stock status (e.g., "50 cartelas disponíveis").

  * Fast Quantity Selectors: Large, easy-to-tap [-] and [+] buttons to change the quantity of cartelas instantly, updating the cart total in real-time.

- Order Summary Sidebar/Bottom Sheet:

  * Show selected products, quantities (e.g., "3x Cartela Ovos Brancos"), and subtotal.

  * Payment Method selector: Quick toggle buttons for "Pix", "Dinheiro", and "Cartão".

  * Delivery Status toggle: "Pendente" or "Pago".

  * A prominent Gold button: "Confirmar e Enviar Pedido". When clicked, it saves the order and automatically generates a WhatsApp share link with a formatted receipt text.



2. TAB "ROTAS E LOGÍSTICA" (Delivery & Expedition Dashboard):

- Top Section: Horizontal scrollable filter badges representing delivery neighborhoods/routes (Include default options: "Boiçucanga", "Camburi", "Baleia", "Juquehy", "Barra do Una"). Clicking a neighborhood filters the orders below.

- Order List: Display orders belonging to the selected neighborhood as clean cards.

- Each Order Card must show:

  * Customer Name, Delivery Address, and Phone Number.

  * Order Summary (e.g., "2x Cartela Ovos Brancos, 1x Dúzia").

  * Total Value in Gold text.

  * Payment Status badge (Green for "Pago", Yellow for "Pendente").

  * Two Quick Action Buttons:

    1. A WhatsApp Icon button that opens a pre-filled message: "Olá [Nome], seu pedido de ovos já está na rota de entrega e chega em breve!".

    2. A Dull Blue button "Concluir Entrega" which changes the order status to completed and removes it from the active route view.



Database & Logic Requirements:

- Simulate or scaffold a relational structure with Tables for: Customers (Name, Phone, Address, Neighborhood), Products (Name, Unit Type like 'Cartela 30 un', Price, Stock), and Orders (Customer, Items, Total, Payment Method, Status, Created At).

- Ensure all calculation logic for subtotals, totals, and stock deductions works se

amlessly within the UI component state.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cartela-dash.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2f36f258-f73e-4fdc-be86-951aa5c41466).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
