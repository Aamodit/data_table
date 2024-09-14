import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import axios from 'axios';
import 'primereact/resources/themes/arya-blue/theme.css'; // PrimeReact dark theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Define types for artwork and API response
interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: string;
    date_end: string;
}

interface ApiResponse {
    artworks: Artwork[];
    total: number;
}

const App: React.FC = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [rowsToSelect, setRowsToSelect] = useState<number>(0);
    const overlayPanelRef = useRef<OverlayPanel>(null);
    const rowsPerPage = 10;

    useEffect(() => {
        fetchArtworks(page).then(data => {
            setArtworks(data.artworks);
            setTotalRecords(data.total);
        });
    }, [page]);

    const fetchArtworks = async (page: number): Promise<ApiResponse> => {
        const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
        return {
            artworks: response.data.data.map((artwork: any) => ({
                id: artwork.id,
                title: artwork.title,
                place_of_origin: artwork.place_of_origin,
                artist_display: artwork.artist_display,
                inscriptions: artwork.inscriptions,
                date_start: artwork.date_start,
                date_end: artwork.date_end,
            })),
            total: response.data.pagination.total,
        };
    };

    const handleSelectRows = () => {
        // Select rows from the current page
        const availableRows = artworks.slice(0, rowsToSelect);
        setSelectedRows(availableRows);
        overlayPanelRef.current?.hide();
    };

    const onPageChange = (event: any) => setPage(event.page + 1);

    const selectAllTemplate = () => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
                icon="pi pi-chevron-down"
                className="p-button-text"
                onClick={(e) => overlayPanelRef.current?.toggle(e)}
            />
            <OverlayPanel ref={overlayPanelRef} showCloseIcon>
                <div style={{ padding: '1rem', backgroundColor: '#333', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Select Rows</h4>
                    <InputNumber
                        value={rowsToSelect}
                        onValueChange={(e) => setRowsToSelect(e.value || 0)}
                        placeholder="Enter number"
                        style={{ width: '100%', marginBottom: '1rem' }}
                    />
                    <Button
                        label="Select"
                        onClick={handleSelectRows}
                        className="p-button p-button-success p-button-block"
                        style={{ fontWeight: 'bold', color: '#fff' }}
                    />
                </div>
            </OverlayPanel>
        </div>
    );

    return (
        <div style={{ backgroundColor: '#333', color: '#fff', padding: '20px', minHeight: '100vh' }}>
            <DataTable
                value={artworks}
                selection={selectedRows}
                onSelectionChange={(e) => setSelectedRows(e.value || [])}
                paginator rows={rowsPerPage} lazy totalRecords={totalRecords}
                onPage={onPageChange} selectionMode="multiple" dataKey="id"
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3em' }}/>
                <Column header={selectAllTemplate} />
                <Column field="title" header="Title" />
                <Column field="place_of_origin" header="Place of Origin" />
                <Column field="artist_display" header="Artist" />
                <Column field="inscriptions" header="Inscriptions" />
                <Column field="date_start" header="Date Start" />
                <Column field="date_end" header="Date End" />
            </DataTable>
        </div>
    );
};

export default App;