'use client';

import { useState } from 'react';

type Item = {
  id: string;
  url: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
};

export default function OrcamentoApp() {
  const [items, setItems] = useState<Item[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [laborPercent, setLaborPercent] = useState<number>(20);
  const [conditions, setConditions] = useState(
    'Condições de pagamento: 50% no aceite da proposta, 50% na entrega e comissionamento. Validade da proposta: 15 dias.'
  );

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    setLoading(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });
      const data = await res.json();

      setItems([
        ...items,
        {
          id: crypto.randomUUID(),
          url: urlInput,
          title:
            data.title && data.title !== 'Equipamento sem título definido'
              ? data.title
              : 'Nome do Equipamento (Editar)',
          image: data.image || '',
          price: 0,
          quantity: 1,
        },
      ]);
    } catch (error) {
      // Se der erro, adiciona na mesma mas permite edição manual total
      setItems([
        ...items,
        {
          id: crypto.randomUUID(),
          url: urlInput,
          title: 'Nome do Equipamento (Editar)',
          image: '',
          price: 0,
          quantity: 1,
        },
      ]);
    }
    setUrlInput('');
    setLoading(false);
  };

  const updateItem = (id: string, field: keyof Item, value: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const subtotalEquipments = items.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );
  const laborValue = subtotalEquipments * ((laborPercent || 0) / 100);
  const grandTotal = subtotalEquipments + laborValue;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8 font-sans print:bg-white print:text-black">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b border-slate-700 pb-6 print:border-gray-300">
          <h1 className="text-4xl font-bold tracking-tight text-white print:text-black">
            DOMUS <span className="text-blue-500 font-light">by Datum</span>
          </h1>
          <p className="text-slate-400 text-lg mt-1 print:text-gray-600">
            Precision in every room.
          </p>
        </header>

        <section className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 print:hidden">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Adicionar Equipamento
          </h2>
          <form onSubmit={handleAddItem} className="flex gap-4">
            <input
              type="url"
              placeholder="Cole o link do Mercado Livre, Amazon ou Distribuidor aqui..."
              className="flex-1 bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Adicionar ao Orçamento'}
            </button>
          </form>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-white mb-4 print:text-black">
            Escopo do Projeto
          </h3>
          {items.length === 0 ? (
            <p className="text-slate-500 italic">
              Nenhum equipamento adicionado ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-slate-800 p-4 rounded border border-slate-700 print:bg-transparent print:border-b print:border-gray-300 print:p-2"
                >
                  <div className="w-20 h-20 bg-white rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <span className="text-slate-400 text-xs text-center p-2">
                        Sem imagem
                      </span>
                    )}
                  </div>

                  {/* Agora o título é um campo de texto editável para quando o site bloquear a leitura */}
                  <div className="flex-1 min-w-0 w-full print:hidden">
                    <label className="block text-xs text-slate-400 mb-1">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-lg font-medium focus:border-blue-500 outline-none"
                      value={item.title}
                      onChange={(e) =>
                        updateItem(item.id, 'title', e.target.value)
                      }
                    />
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                    >
                      Ver link original
                    </a>
                  </div>

                  {/* Visão de impressão do título */}
                  <div className="hidden print:block flex-1 min-w-0 w-full">
                    <span className="text-lg font-medium text-black block">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 items-center print:hidden">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Preço Unitário (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-32 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-right focus:border-blue-500 outline-none"
                        value={item.price || ''}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'price',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Qtd
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-20 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-center focus:border-blue-500 outline-none"
                        value={item.quantity || 1}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'quantity',
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-5 text-red-400 hover:text-red-300"
                      title="Remover item"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="hidden print:flex w-full justify-between mt-2 text-sm text-black">
                    <span>
                      Qtd: {item.quantity} x {formatMoney(item.price)}
                    </span>
                    <span className="font-semibold">
                      {formatMoney((item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {items.length > 0 && (
          <section className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 print:bg-transparent print:border-none print:shadow-none print:p-0">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="flex-1 space-y-4">
                <div className="print:hidden">
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Margem de Mão de Obra / Serviço (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-32 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                    value={laborPercent}
                    onChange={(e) =>
                      setLaborPercent(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 print:text-black font-bold">
                    Condições de Pagamento e Observações
                  </label>
                  <textarea
                    className="w-full h-32 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white print:bg-transparent print:border-none print:text-black print:p-0 resize-none"
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full md:w-72 space-y-3 text-right">
                <div className="flex justify-between text-slate-400 print:text-gray-700">
                  <span>Subtotal Equipamentos:</span>
                  <span>{formatMoney(subtotalEquipments)}</span>
                </div>
                <div className="flex justify-between text-slate-400 print:text-gray-700">
                  <span>Mão de Obra ({laborPercent || 0}%):</span>
                  <span>{formatMoney(laborValue)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-white border-t border-slate-600 pt-3 mt-3 print:text-black print:border-gray-400">
                  <span>Total Geral:</span>
                  <span className="text-blue-400 print:text-black">
                    {formatMoney(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9V2h12v7"></path>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect width="12" height="8" x="6" y="14"></rect>
                </svg>
                Gerar PDF (Imprimir)
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
